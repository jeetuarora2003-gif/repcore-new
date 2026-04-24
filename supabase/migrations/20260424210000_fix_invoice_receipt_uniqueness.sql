/*
  FIX: Multi-tenant unique constraints on invoices and payments.
  Previously, invoice_number and receipt_number were globally UNIQUE across all gyms.
  This caused conflicts when a new gym tried to generate "INV-2026-0001" if another gym already had it.
  Now they are UNIQUE per gym.
*/

DO $$
BEGIN
  -- Drop the global unique constraint for invoices
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_invoice_number_key'
  ) THEN
    ALTER TABLE invoices DROP CONSTRAINT invoices_invoice_number_key;
  END IF;

  -- Add the gym-scoped unique constraint for invoices
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_gym_id_invoice_number_key'
  ) THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_gym_id_invoice_number_key UNIQUE (gym_id, invoice_number);
  END IF;

  -- Drop the global unique constraint for payments
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_receipt_number_key'
  ) THEN
    ALTER TABLE payments DROP CONSTRAINT payments_receipt_number_key;
  END IF;

  -- Add the gym-scoped unique constraint for payments
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_gym_id_receipt_number_key'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_gym_id_receipt_number_key UNIQUE (gym_id, receipt_number);
  END IF;
END $$;
