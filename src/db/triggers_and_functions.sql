-- DROP antigo (opcional)
DROP TRIGGER IF EXISTS trg_log_user_deactivation ON deactivated_users;
DROP FUNCTION IF EXISTS log_user_deactivation();

DROP TRIGGER IF EXISTS trigger_update_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();


-- Function de log de desativação/reativação
CREATE OR REPLACE FUNCTION log_user_deactivation()
RETURNS TRIGGER AS $$
DECLARE
    v_deactivated_by_name TEXT;
    v_reactivated_by_name TEXT;
BEGIN
    -- Buscar o nome do admin responsável pela desativação (se aplicável)
    IF NEW.deactivated_by IS NOT NULL THEN
        SELECT name INTO v_deactivated_by_name
        FROM users
        WHERE id = NEW.deactivated_by;
    END IF;

    -- Buscar o nome do admin responsável pela reativação (se aplicável)
    IF NEW.reactivated_by IS NOT NULL THEN
        SELECT name INTO v_reactivated_by_name
        FROM users
        WHERE id = NEW.reactivated_by;
    END IF;

    -- Caso de desativação
    IF NEW.deactivated_at IS NOT NULL 
       AND (OLD IS NULL OR OLD.deactivated_at IS DISTINCT FROM NEW.deactivated_at) THEN
        INSERT INTO users_deactivation_history (
            user_id,
            deactivation_reasons,
            deactivation_dates,
            deactivations_by_admin
        )
        VALUES (
            NEW.user_id,
            ARRAY[NEW.deactivated_reason],
            ARRAY[NEW.deactivated_at],
            ARRAY[v_deactivated_by_name]
        )
        ON CONFLICT (user_id) DO UPDATE
        SET
            deactivation_reasons = users_deactivation_history.deactivation_reasons || EXCLUDED.deactivation_reasons,
            deactivation_dates   = users_deactivation_history.deactivation_dates || EXCLUDED.deactivation_dates,
            deactivations_by_admin = users_deactivation_history.deactivations_by_admin || EXCLUDED.deactivations_by_admin;

    -- Caso de reativação
    ELSIF NEW.reactivated_at IS NOT NULL 
       AND (OLD IS NULL OR OLD.reactivated_at IS DISTINCT FROM NEW.reactivated_at) THEN
        INSERT INTO users_deactivation_history (
            user_id,
            reactivation_reasons,
            reactivation_dates,
            reactivations_by_admin
        )
        VALUES (
            NEW.user_id,
            ARRAY[NEW.reactivated_reason],
            ARRAY[NEW.reactivated_at],
            ARRAY[v_reactivated_by_name]
        )
        ON CONFLICT (user_id) DO UPDATE
        SET
            reactivation_reasons = users_deactivation_history.reactivation_reasons || EXCLUDED.reactivation_reasons,
            reactivation_dates   = users_deactivation_history.reactivation_dates || EXCLUDED.reactivation_dates,
            reactivations_by_admin = users_deactivation_history.reactivations_by_admin || EXCLUDED.reactivations_by_admin;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Trigger para deactivated_users
CREATE TRIGGER trg_log_user_deactivation
AFTER INSERT OR UPDATE ON deactivated_users
FOR EACH ROW
EXECUTE FUNCTION log_user_deactivation();



-- Function para atualizar o updated_at da tabela users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para tabela users
CREATE TRIGGER trigger_update_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();