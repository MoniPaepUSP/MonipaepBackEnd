-- Run gen_random_uuid() to generate a UUID for the id field
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clear data from specific tables
TRUNCATE TABLE usm, patient, system_user, permissions, symptom, disease, appointment, vaccines, comorbidity, special_condition, faq, faq_group  RESTART IDENTITY CASCADE;

-- Insert one user into the patients table
-- password: Password@123
INSERT INTO patient (
    id, name, password, cpf, email, gender, phone, last_gps_location, allow_sms, work_address, home_address, neighborhood, house_number, has_health_plan, birthdate, status, active_account, created_at, updated_at
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

-- Insert some example data into the usm table
INSERT INTO usm (id, name, state, city, neighborhood, street, number, formatted_address, weekday_descriptions, latitude, longitude)
VALUES 
(
  '5b88a57f-55d0-44cb-9bb0-504d82d36900',
  'UPA Santa Felícia', 'SP', 'São Carlos', 'Parque Santa Felicia Jardim', 'R. Dr. João Navarro Siquerolli', NULL,
  'R. Dr. João Navarro Siquerolli, s/n - Parque Santa Felicia Jardim, São Carlos - SP, 13563-714, Brasil',
  ARRAY[
    'segunda-feira: Atendimento 24 horas',
    'terça-feira: Atendimento 24 horas',
    'quarta-feira: Atendimento 24 horas',
    'quinta-feira: Atendimento 24 horas',
    'sexta-feira: Atendimento 24 horas',
    'sábado: Atendimento 24 horas',
    'domingo: Atendimento 24 horas'
  ],
  -21.9962442, -47.9150354
),
(
  '5b88a57f-55d0-44cb-9bb0-504d82d36901',
  'UPA Vila Prado', 'SP', 'São Carlos', 'Vila Prado', 'Av. Grécia', '229',
  'Av. Grécia, 229 - Vila Prado, São Carlos - SP, 13574-140, Brasil',
  ARRAY[
    'segunda-feira: Atendimento 24 horas',
    'terça-feira: Atendimento 24 horas',
    'quarta-feira: Atendimento 24 horas',
    'quinta-feira: Atendimento 24 horas',
    'sexta-feira: Atendimento 24 horas',
    'sábado: Atendimento 24 horas',
    'domingo: Atendimento 24 horas'
  ],
  -22.035452, -47.8963573
),
(
  '5b88a57f-55d0-44cb-9bb0-504d82d36902',
  'UPA Cidade Aracy', 'SP', 'São Carlos', 'Cidade Aracy', 's/r', NULL,
  'Cidade Aracy, São Carlos - SP, 13566, Brasil',
  ARRAY[
    'segunda-feira: Atendimento 24 horas',
    'terça-feira: Atendimento 24 horas',
    'quarta-feira: Atendimento 24 horas',
    'quinta-feira: Atendimento 24 horas',
    'sexta-feira: Atendimento 24 horas',
    'sábado: Atendimento 24 horas',
    'domingo: Atendimento 24 horas'
  ],
  -22.0551792, -47.9133565
),
(
  '5b88a57f-55d0-44cb-9bb0-504d82d36903',
  'UNIDADE DE PRONTO ATENDIMENTO UPA CIDADE ARACY', 'SP', 'São Carlos', 'Cidade Aracy', 'R. Reinaldo Pizani', '357',
  'R. Reinaldo Pizani, 357 - Cidade Aracy, São Carlos - SP, 13573-228, Brasil',
  NULL,
  -22.0533165, -47.9143543
),
(
  '5b88a57f-55d0-44cb-9bb0-504d82d36904',
  'UBS Santa Felícia', 'SP', 'São Carlos', 'Parque Santa Felicia Jardim', 'R. Joaquim Augusto Ribeiro de Souza', '1430',
  'R. Joaquim Augusto Ribeiro de Souza, 1430 - Parque Santa Felicia Jardim, São Carlos - SP, 13563-330, Brasil',
  ARRAY[
    'segunda-feira: 07:00 – 17:00',
    'terça-feira: 07:00 – 17:00',
    'quarta-feira: 07:00 – 17:00',
    'quinta-feira: 07:00 – 17:00',
    'sexta-feira: 07:00 – 17:00',
    'sábado: Fechado',
    'domingo: Fechado'
  ],
  -21.9990823, -47.9194131
);

INSERT INTO faq_group (id, name)
VALUES  
  ('5b88a57f-55d0-44cb-9bb0-504d82d36801', 'Sobre a Dengue'),
  ('5b88a57f-55d0-44cb-9bb0-504d82d36802', 'Sobre a Saúde');

INSERT INTO faq (faq_group_id, question, answer)
VALUES
  ('5b88a57f-55d0-44cb-9bb0-504d82d36801', 'Quais são os sintomas da dengue?', 'Os sintomas incluem febre, dor de cabeça, dor atrás dos olhos, dores musculares e articulares, náuseas e erupção cutânea.'),
  ('5b88a57f-55d0-44cb-9bb0-504d82d36801', 'Como posso prevenir a dengue?', 'Use repelente, elimine água parada e use roupas de manga longa.'),
  ('5b88a57f-55d0-44cb-9bb0-504d82d36801', 'Qual é o tratamento para a dengue?', 'O tratamento é sintomático, com hidratação e medicamentos para dor e febre.'),
  ('5b88a57f-55d0-44cb-9bb0-504d82d36802', 'Quando devo procurar um médico?', 'Se você tiver sintomas graves ou persistentes, procure um médico imediatamente.');

  -- Insert some example data into the appointments table
INSERT INTO appointment (date, when_remember, type, usm_id, patient_id)
VALUES 
  ('2024-11-05 10:00:00', '2024-10-04 09:00:00', 'Vaccination', '5b88a57f-55d0-44cb-9bb0-504d82d36904', '5b88a57f-55d0-44cb-9bb0-504d82d368c5'),
  ('2024-11-19 14:00:00', '2024-10-05 13:00:00', 'Check-up', '5b88a57f-55d0-44cb-9bb0-504d82d36903', '5b88a57f-55d0-44cb-9bb0-504d82d368c5'),
  ('2024-12-07 09:30:00', '2024-10-06 08:30:00', 'Consultation', '5b88a57f-55d0-44cb-9bb0-504d82d36904', '5b88a57f-55d0-44cb-9bb0-504d82d368c5');

-- Insert the Admin user into the systemUser table
-- password: Password@123
INSERT INTO system_user (id, name, cpf, email, password, department, created_at)
VALUES 
  ('5b88a57f-55d0-44cb-9bb0-504d82d368c6', 'Authorized', '12345678901', 'admin1@example.com', '$2b$10$HZUxwBezHEFZBBp0D19RXeozrE/YdghzTWEWkkRavC3t4o.6oCei6', 'USM', NOW()),
  ('5b88a57f-55d0-44cb-9bb0-504d82d368c7', 'LocalAdmin', '12345678902', 'admin2@example.com', '$2b$10$HZUxwBezHEFZBBp0D19RXeozrE/YdghzTWEWkkRavC3t4o.6oCei6', 'USM', NOW()),
  ('5b88a57f-55d0-44cb-9bb0-504d82d368c8', 'GeneralAdmin', '12345678903', 'admin3@example.com', '$2b$10$HZUxwBezHEFZBBp0D19RXeozrE/YdghzTWEWkkRavC3t4o.6oCei6', 'USM', NOW());

-- Insert permissions
INSERT INTO permissions (user_id, authorized, local_adm, general_adm)
VALUES 
  ('5b88a57f-55d0-44cb-9bb0-504d82d368c6', true, false, false),
  ('5b88a57f-55d0-44cb-9bb0-504d82d368c7', true, true, false),
  ('5b88a57f-55d0-44cb-9bb0-504d82d368c8', true, true, true);

INSERT INTO special_condition (name, description)
VALUES
  ('Lactente', 'Criança com menos de 1 ano de idade'),
  ('Gestante', 'Mulher grávida'),
  ('Pessoa com Transtorno do Espectro Autista', 'Indivíduo diagnosticado com TEA'),
  ('Adulto com mais de 60 anos', 'Indivíduo com idade superior a 60 anos'),
  ('Fumante', 'Indivíduo que fuma'),
  ('Criança com menos de 5 anos', 'Indivíduo com menos de 5 anos de idade'),
  ('Pessoa que realiza tratamento de imunossupressão', 'Indivíduo em tratamento que compromete o sistema imunológico'),
  ('Pessoa no período pós-parto', 'Mulher que deu à luz recentemente');

INSERT INTO comorbidity (name, description)
VALUES
  ('Diabetes', 'Doença crônica caracterizada por níveis elevados de glicose no sangue'),
  ('Hipertensão arterial', 'Pressão arterial elevada de forma persistente'),
  ('Doenças cardíacas', 'Condições que afetam o coração e os vasos sanguíneos'),
  ('Doenças pulmonares crônicas', 'Condições que afetam os pulmões e a respiração'),
  ('Obesidade', 'Acúmulo excessivo de gordura corporal'),
  ('Doenças autoimunes', 'Condições em que o sistema imunológico ataca o próprio corpo'),
  ('Doenças neurológicas crônicas', 'Condições que afetam o sistema nervoso'),
  ('Doenças alérgicas', 'Condições que envolvem reações alérgicas'),
  ('Doenças renais crônicas', 'Condições que afetam os rins e sua função'),
  ('Pneumopatias crônicas graves', 'Condições pulmonares graves e persistentes'),
  ('Hemoglobinopatias graves', 'Condições que afetam a hemoglobina no sangue'),
  ('Doença ácido péptica', 'Condições que afetam o trato digestivo'),
  ('Hepatopatias crônicas', 'Condições que afetam o fígado e sua função'),
  ('Doenças endócrinas', 'Condições que afetam as glândulas endócrinas e a produção de hormônios');

-- Inserting some symptoms
INSERT INTO symptom (name, description)
VALUES
  ('Febre', 'Aumento da temperatura corporal'),
  ('Calafrios', 'Sensação de frio e tremores'),
  ('Dor de garganta', 'Dor ou irritação na garganta'),
  ('Dor de cabeça', 'Dor na região da cabeça'),
  ('Cansaço', 'Sensação de fadiga ou exaustão'),
  ('Dores musculares', 'Dor ou desconforto nos músculos'),
  ('Tosse', 'Expulsão de ar dos pulmões'),
  ('Dificuldade para respirar', 'Sensação de falta de ar'),
  ('Perda de paladar', 'Incapacidade de sentir o gosto dos alimentos'),
  ('Perda de olfato', 'Incapacidade de sentir o cheiro'),
  ('Manchas na pele', 'Alterações na pele'),
  ('Náusea', 'Sensação de enjoo'),
  ('Vômito', 'Expulsão do conteúdo gástrico pela boca'),
  ('Diarreia', 'Fezes líquidas e frequentes'),
  ('Inchaço', 'Aumento de volume de uma parte do corpo'),
  ('Dor abdominal', 'Dor na região do abdômen'),
  ('Confusão mental', 'Desorientação'),
  ('Tontura', 'Sensação de desequilíbrio'),
  ('Sangramento nasal', 'Sangramento pelo nariz'),
  ('Falta de apetite', 'Diminuição ou ausência de vontade de comer'),
  ('Irritabilidade', 'Facilidade para se irritar ou ficar nervoso'),
  ('Sensibilidade à luz', 'Desconforto ou dor ao olhar para a luz'),
  ('Suor excessivo', 'Produção anormal de suor'),
  ('Palpitações', 'Sensação de batimentos cardíacos acelerados ou irregulares'),
  ('Erupções cutâneas', 'Lesões na pele como bolhas ou vermelhidão'),
  ('Rigidez na nuca', 'Dificuldade ou dor ao mover o pescoço'),
  ('Dificuldade para engolir', 'Dor ou sensação de bloqueio ao engolir'),
  ('Dor nas articulações', 'Desconforto ou dor nas juntas'),
  ('Olhos vermelhos', 'Inflamação ou irritação ocular'),
  ('Zumbido no ouvido', 'Sensação de som ou ruído nos ouvidos'),
  ('Sensação de desmaio', 'Sensação iminente de perda de consciência'),
  ('Pele amarelada', 'Coloração amarelada da pele e dos olhos'),
  ('Inchaço nos gânglios linfáticos', 'Aumento dos linfonodos, geralmente no pescoço ou axilas'),
  ('Tremores', 'Movimentos involuntários rítmicos de partes do corpo'),
  ('Respiração ofegante', 'Respiração rápida e superficial'),
  ('Batimentos cardíacos acelerados', 'Aumento da frequência cardíaca'),
  ('Dor no peito', 'Desconforto ou dor na região torácica'),
  ('Olhos lacrimejantes', 'Produção excessiva de lágrimas'),
  ('Alterações na visão', 'Visão turva, embaçada ou dupla');