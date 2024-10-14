-- Run gen_random_uuid() to generate a UUID for the id field
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clear data from specific tables
TRUNCATE TABLE "usm", "patients", "systemUser", "permissions", "symptom", "disease", "healthProtocols", "assigned_healthprotocol", "appointments", "vaccines"  RESTART IDENTITY CASCADE;

-- Insert some example data into the usm table
INSERT INTO "usm" (name, address, neighborhood, latitude, longitude)
VALUES 
('Hospital Unimed São Carlos', 'R. Dona Alexandrina, 1683', 'Centro', -22.0109, -47.8901),
('UBS Santa Paula São Carlos', 'R. Luís Saia, 44', 'Jardim Santa Paula', -22.0027, -47.9014),
('Santa Casa São Carlos', 'R. Paulino Botelho de Abreu Sampaio, 573', 'Jardim Pureza', -22.0111, -47.9014),
('UBS Vila Isabel', 'R. Vicente de Carvalho, 566', 'Vila Izabel', -22.0322, -47.8866),
('UBS São José', 'Av. Araraquara, 422', 'Vila Brasilia', -22.0006, -47.8796);

-- Insert one user into the patients table
-- password: Password@123
INSERT INTO patients (
    id, name, password, "CPF", email, gender, phone, "lastGPSLocation", "allowSMS", "workAddress", "homeAddress", neighborhood, "houseNumber", "hasHealthPlan", birthdate, status, "activeAccount", "createdAt", "lastUpdate"
)
VALUES (
    '5b88a57f-55d0-44cb-9bb0-504d82d368c5',  -- id
    'User',                                  -- name
    '$2b$10$HZUxwBezHEFZBBp0D19RXeozrE/YdghzTWEWkkRavC3t4o.6oCei6', -- password
    '123.456.789-00',                        -- CPF
    'user@example.com',                      -- email
    'masculino',                             -- gender
    '(11) 91111-1111',                       -- phone
    NULL,                                    -- lastGPSLocation (NULL because it's null)
    FALSE,                                   -- allowSMS
    NULL,                                    -- workAddress (NULL because it's null)
    '13560-515',                             -- homeAddress
    'Jardim Lutfalla',                       -- neighborhood
    394,                                     -- houseNumber
    FALSE,                                   -- hasHealthPlan
    '2001-01-01',                            -- birthdate (ISO format for date)
    'Saudável',                              -- status
    TRUE,                                    -- activeAccount
    '2024-10-14T15:57:45.818Z',              -- createdAt (timestamp)
    '2024-10-14T15:57:45.818Z'               -- lastUpdate (timestamp)
);

-- Insert the Admin user into the systemUser table
-- password: Password@123
INSERT INTO "systemUser" (id, name, "CPF", email, password, department, "createdAt")
VALUES 
('5b88a57f-55d0-44cb-9bb0-504d82d368c6', 'Authorized', '12345678901', 'admin1@example.com', '$2b$10$HZUxwBezHEFZBBp0D19RXeozrE/YdghzTWEWkkRavC3t4o.6oCei6', 'USM', NOW()),
('5b88a57f-55d0-44cb-9bb0-504d82d368c7', 'LocalAdmin', '12345678902', 'admin2@example.com', '$2b$10$HZUxwBezHEFZBBp0D19RXeozrE/YdghzTWEWkkRavC3t4o.6oCei6', 'USM', NOW()),
('5b88a57f-55d0-44cb-9bb0-504d82d368c8', 'GeneralAdmin', '12345678903', 'admin3@example.com', '$2b$10$HZUxwBezHEFZBBp0D19RXeozrE/YdghzTWEWkkRavC3t4o.6oCei6', 'USM', NOW());

-- Insert permissions
INSERT INTO "permissions" ("userId", authorized, "localAdm", "generalAdm")
VALUES 
('5b88a57f-55d0-44cb-9bb0-504d82d368c6', true, false, false),
('5b88a57f-55d0-44cb-9bb0-504d82d368c7', true, true, false),
('5b88a57f-55d0-44cb-9bb0-504d82d368c8', true, true, true);

-- Inserting some symptoms
INSERT INTO "symptom" (symptom)
VALUES
  ('Febre'),
  ('Dor de cabeça'),
  ('Cansaço'),
  ('Dores musculares'),
  ('Tosse'),
  ('Dificuldade para respirar'),
  ('Perda de paladar'),
  ('Perda de olfato'),
  ('Manchas na pele'),
  ('Náusea'),
  ('Vômito'),
  ('Diarreia'),
  ('Inchaço'),
  ('Dor abdominal'),
  ('Confusão mental'),
  ('Tontura'),
  ('Sangramento nasal');


-- Insert some example data into the disease table
INSERT INTO "disease" (name, "infected_Monitoring_Days", "suspect_Monitoring_Days")
VALUES
('Dengue', 14, 7);

-- Insert some example data into the healthProtocols table
INSERT INTO "healthProtocols" (id, title, description)
VALUES
(gen_random_uuid(), 'SUSPEITA DE DENGUE GRUPO A', 'Caso suspeito de dengue sem sinais de alarme, sem choque, sem comorbidades e sem grupo de risco. Atendimento: UBS.'),
(gen_random_uuid(), 'SUSPEITA DE DENGUE GRUPO B', 'Caso suspeito de dengue sem sinais de alarme, sem choque; com sangramento de pele ou comorbidades/grupo de risco. Atendimento: UBS/UPA.'),
(gen_random_uuid(), 'SUSPEITA DE DENGUE GRUPO C', 'Caso suspeito de dengue com sinais de alarme. Atendimento: UPA.'),
(gen_random_uuid(), 'SUSPEITA DE DENGUE GRUPO D', 'Caso suspeito de dengue com choque, sangramento grave ou disfunção grave de órgãos. Atendimento: UPA.');

-- Relate the healthProtocols with the disease
DO $$
DECLARE
  protocol_id UUID;
BEGIN
  -- Grupo A
  SELECT id INTO protocol_id FROM "healthProtocols" WHERE title = 'SUSPEITA DE DENGUE GRUPO A';
  INSERT INTO "assigned_healthprotocol" (disease_name, healthprotocol_id) 
  VALUES ('Dengue', protocol_id);

  -- Grupo B
  SELECT id INTO protocol_id FROM "healthProtocols" WHERE title = 'SUSPEITA DE DENGUE GRUPO B';
  INSERT INTO "assigned_healthprotocol" (disease_name, healthprotocol_id) 
  VALUES ('Dengue', protocol_id);

  -- Grupo C
  SELECT id INTO protocol_id FROM "healthProtocols" WHERE title = 'SUSPEITA DE DENGUE GRUPO C';
  INSERT INTO "assigned_healthprotocol" (disease_name, healthprotocol_id) 
  VALUES ('Dengue', protocol_id);

  -- Grupo D
  SELECT id INTO protocol_id FROM "healthProtocols" WHERE title = 'SUSPEITA DE DENGUE GRUPO D';
  INSERT INTO "assigned_healthprotocol" (disease_name, healthprotocol_id) 
  VALUES ('Dengue', protocol_id);
END $$;

-- Insert some example data into the appointments table
INSERT INTO "appointments" (id, date, "whenRemember", location, type, patient_id)
VALUES 
(gen_random_uuid(), '2024-11-05 10:00:00', '2024-10-04 09:00:00', 'USM Clinic A', 'Vaccination', '5b88a57f-55d0-44cb-9bb0-504d82d368c5'),
(gen_random_uuid(), '2024-11-19 14:00:00', '2024-10-05 13:00:00', 'USM Clinic B', 'Check-up', '5b88a57f-55d0-44cb-9bb0-504d82d368c5'),
(gen_random_uuid(), '2024-12-07 09:30:00', '2024-10-06 08:30:00', 'USM Clinic C', 'Consultation', '5b88a57f-55d0-44cb-9bb0-504d82d368c5');

-- Insert some example data into the vaccines table
INSERT INTO "vaccines" (id, date, type, patient_id, usm_name)
VALUES
  (gen_random_uuid(), '2024-12-15 10:30:00', 'Vacina contra COVID-19', '5b88a57f-55d0-44cb-9bb0-504d82d368c5', 'Hospital Unimed São Carlos'),
  (gen_random_uuid(), '2024-12-10 14:00:00', 'Vacina contra Febre Amarela', '5b88a57f-55d0-44cb-9bb0-504d82d368c5', 'Hospital Unimed São Carlos'),
  (gen_random_uuid(), '2024-12-19 09:45:00', 'Vacina contra Gripe', '5b88a57f-55d0-44cb-9bb0-504d82d368c5', 'Hospital Unimed São Carlos'),
  (gen_random_uuid(), '2024-11-20 11:20:00', 'Vacina contra Hepatite B', '5b88a57f-55d0-44cb-9bb0-504d82d368c5', 'Santa Casa São Carlos'),
  (gen_random_uuid(), '2024-11-25 08:30:00', 'Vacina contra Raiva', '5b88a57f-55d0-44cb-9bb0-504d82d368c5', 'Santa Casa São Carlos');

