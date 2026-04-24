-- Function to delete attendance records older than 6 months
CREATE OR REPLACE FUNCTION clean_old_attendance()
RETURNS void AS $$
BEGIN
  DELETE FROM attendance 
  WHERE checked_in_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
