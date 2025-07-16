-- Run gen_random_uuid() to generate a UUID for the id field
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clear data from specific tables
TRUNCATE TABLE usm, patient, system_user, permissions, symptom, appointment, vaccines, comorbidity, special_condition, faq, faq_group RESTART IDENTITY CASCADE;

-- Insert one user into the patients table
-- password: Password@123
INSERT INTO patient (
    id, name, password, cpf, email, gender, phone, birthdate, cep, state, city, neighborhood, street, house_number, allow_sms, has_health_plan, status, active_account
)
VALUES (
    '5b88a57f-55d0-44cb-9bb0-504d82d368c5',  -- id
    'User',                                  -- name
    '$2b$10$HZUxwBezHEFZBBp0D19RXeozrE/YdghzTWEWkkRavC3t4o.6oCei6', -- password
    '123.456.789-00',                        -- CPF
    'user@example.com',                      -- email
    'masculino',                             -- gender
    '(11) 91111-1111',                       -- phone
    '2001-01-01',                            -- birthdate (ISO format for date)
    '13560515',                              -- cep
    'SP',                                    -- state
    'São Carlos',                            -- city
    'Jardim Lutfalla',                       -- neighborhood
    'Rua Jacinto Favoreto',                  -- street
    394,                                     -- houseNumber
    FALSE,                                   -- allowSMS
    FALSE,                                   -- hasHealthPlan
    'Saudável',                              -- status
    TRUE                                     -- activeAccount
);

-- Insert some example data into the usm table
INSERT INTO usm (id, name, state, city, neighborhood, street, number, weekday_descriptions, latitude, longitude)
VALUES 
(
  '5b88a57f-55d0-44cb-9bb0-504d82d36900',
  'UPA Santa Felícia', 'SP', 'São Carlos', 'Parque Santa Felicia Jardim', 'R. Dr. João Navarro Siquerolli', NULL,
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
  NULL,
  -22.0533165, -47.9143543
),
(
  '5b88a57f-55d0-44cb-9bb0-504d82d36904',
  'UBS Santa Felícia', 'SP', 'São Carlos', 'Parque Santa Felicia Jardim', 'R. Joaquim Augusto Ribeiro de Souza', '1430',
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
  ('Lactente', 'Criança com menos de 12 meses de idade'),
  ('Criança menor de 5 anos', 'Indivíduo com idade inferior a 5 anos'),
  ('Adulto com 60 anos ou mais', 'Indivíduo com 60 anos de idade ou mais'),
  ('Gestante', 'Mulher grávida'),
  ('Gestante de alto risco', 'Gestante com condições clínicas que aumentam o risco gestacional'),
  ('Puérpera', 'Mulher no período pós-parto, até 45 dias após o parto'),
  ('Pessoa com deficiência', 'Indivíduo com deficiência física, sensorial, intelectual ou múltipla'),
  ('Pessoa com Transtorno do Espectro Autista (TEA)', 'Indivíduo com diagnóstico de TEA'),
  ('Pessoa em tratamento imunossupressor', 'Indivíduo em tratamento que compromete o sistema imunológico'),
  ('Fumante', 'Pessoa que faz uso regular de produtos derivados do tabaco'),
  ('Pessoa em situação de rua', 'Indivíduo sem residência fixa e em situação de vulnerabilidade social'),
  ('Pessoa privada de liberdade', 'Indivíduo em regime de reclusão em unidades prisionais'),
  ('Pessoa institucionalizada', 'Indivíduo residente em instituições de longa permanência ou acolhimento'),
  ('Trabalhador da saúde', 'Profissional atuante em estabelecimentos de saúde públicos ou privados'),
  ('Cuidador de pessoa vulnerável', 'Pessoa responsável por cuidados diretos a idosos, pessoas com deficiência ou doenças crônicas'),
  ('Indígena', 'Pessoa pertencente a povos indígenas'),
  ('Quilombola', 'Pessoa pertencente a comunidades remanescentes de quilombos'),
  ('Imigrante ou refugiado', 'Pessoa que deixou seu país de origem por razões sociais, econômicas ou de segurança'),
  ('Pessoa vivendo em áreas de vulnerabilidade social', 'Indivíduo residente em locais com baixo acesso a serviços de saúde e saneamento'),
  ('Pessoa exposta a risco ocupacional', 'Trabalhador com exposição frequente a agentes biológicos, químicos ou físicos');

INSERT INTO comorbidity (name, description)
VALUES
  ('Diabetes mellitus', 'Doença metabólica crônica caracterizada por hiperglicemia persistente'),
  ('Hipertensão arterial sistêmica', 'Doença caracterizada pela elevação sustentada da pressão arterial'),
  ('Doença cardiovascular', 'Conjunto de condições que afetam o coração e os vasos sanguíneos'),
  ('Doença pulmonar obstrutiva crônica (DPOC)', 'Condição respiratória crônica que dificulta o fluxo de ar nos pulmões'),
  ('Asma grave', 'Doença inflamatória crônica das vias aéreas com crises recorrentes'),
  ('Obesidade grau II ou superior', 'Excesso de gordura corporal com índice de massa corporal (IMC) ≥ 35 kg/m²'),
  ('Doença autoimune sistêmica', 'Condição em que o sistema imune ataca tecidos saudáveis do corpo'),
  ('Distúrbio neurológico crônico', 'Doenças que afetam o sistema nervoso central ou periférico de forma prolongada'),
  ('Alergia grave', 'Reações alérgicas potencialmente fatais, como anafilaxia'),
  ('Doença renal crônica', 'Comprometimento progressivo e irreversível da função renal'),
  ('Pneumopatia crônica grave', 'Doença respiratória crônica com impacto funcional significativo'),
  ('Hemoglobinopatia grave', 'Doenças hereditárias que afetam a estrutura ou produção da hemoglobina'),
  ('Doença ácido-péptica', 'Presença de úlceras no estômago ou duodeno devido à secreção ácida excessiva'),
  ('Hepatopatia crônica', 'Doença progressiva do fígado que compromete sua função'),
  ('Doença endócrina crônica', 'Distúrbios hormonais como hipotireoidismo ou síndrome de Cushing'),
  ('Insuficiência cardíaca', 'Condição em que o coração não consegue bombear sangue adequadamente'),
  ('Neoplasia maligna ativa', 'Câncer com progressão ou em tratamento ativo'),
  ('Tuberculose ativa', 'Infecção bacteriana transmissível dos pulmões ou outros órgãos'),
  ('Infecção por HIV/Aids', 'Condição crônica causada pelo vírus HIV, com ou sem imunossupressão'),
  ('Epilepsia', 'Distúrbio neurológico com crises epilépticas recorrentes'),
  ('Fibrose cística', 'Doença genética que afeta o funcionamento pulmonar e digestivo'),
  ('Doença de Parkinson', 'Doença degenerativa progressiva do sistema nervoso central'),
  ('Esclerose múltipla', 'Doença autoimune que afeta o cérebro e a medula espinhal'),
  ('Insuficiência hepática', 'Perda severa da função do fígado, podendo ser crônica ou aguda'),
  ('Doença renal crônica em diálise', 'Estágio avançado da insuficiência renal com necessidade de hemodiálise'),
  ('Anemia falciforme', 'Tipo grave de hemoglobinopatia hereditária que compromete o transporte de oxigênio'),
  ('Síndrome de Down', 'Condição genética associada a maior risco de comorbidades cardiovasculares e imunológicas');

INSERT INTO symptom (name, description)
VALUES
  ('Febre', 'Aumento anormal da temperatura corporal, geralmente acima de 37,8°C'),
  ('Calafrios', 'Sensação súbita de frio acompanhada de tremores musculares'),
  ('Dor de garganta', 'Inflamação ou irritação na garganta, com ou sem dor ao engolir'),
  ('Dor de cabeça', 'Sensação dolorosa ou latejante na região da cabeça'),
  ('Cansaço', 'Sensação persistente de fadiga física ou mental'),
  ('Dores musculares', 'Desconforto ou dor nos músculos, com ou sem sensibilidade ao toque'),
  ('Tosse', 'Expulsão súbita e forçada de ar pelos pulmões, seca ou com secreção'),
  ('Dificuldade para respirar', 'Sensação de falta de ar ou esforço ao respirar'),
  ('Perda de paladar', 'Redução ou ausência na percepção do gosto dos alimentos'),
  ('Perda de olfato', 'Redução ou ausência na capacidade de sentir cheiros'),
  ('Manchas na pele', 'Alterações cutâneas com coloração anormal'),
  ('Erupções cutâneas', 'Lesões na pele, como bolhas, vergões ou vermelhidão'),
  ('Náusea', 'Sensação de enjoo ou vontade de vomitar'),
  ('Vômito', 'Expulsão forçada do conteúdo do estômago pela boca'),
  ('Diarreia', 'Evacuações frequentes com fezes líquidas ou amolecidas'),
  ('Dor abdominal', 'Desconforto ou dor na região do abdômen'),
  ('Inchaço', 'Aumento de volume em partes do corpo devido a acúmulo de fluidos'),
  ('Confusão mental', 'Estado de desorientação, dificuldade de concentração ou raciocínio'),
  ('Tontura', 'Sensação de instabilidade, vertigem ou desequilíbrio'),
  ('Sensação de desmaio', 'Percepção iminente de perda da consciência'),
  ('Sangramento nasal', 'Perda de sangue pelas narinas'),
  ('Falta de apetite', 'Redução ou ausência da vontade de se alimentar'),
  ('Irritabilidade', 'Mudanças de humor frequentes com maior tendência à irritação'),
  ('Sensibilidade à luz', 'Desconforto ou dor ao olhar para fontes de luz'),
  ('Olhos vermelhos', 'Irritação ocular com coloração avermelhada da esclera'),
  ('Olhos lacrimejantes', 'Produção excessiva de lágrimas'),
  ('Alterações na visão', 'Visão embaçada, dupla ou com pontos cegos'),
  ('Zumbido no ouvido', 'Sons ou ruídos percebidos nos ouvidos sem fonte externa'),
  ('Dor nas articulações', 'Dor ou rigidez nas juntas do corpo'),
  ('Rigidez na nuca', 'Dificuldade ou dor ao movimentar o pescoço'),
  ('Dificuldade para engolir', 'Sensação de bloqueio, dor ou incômodo ao deglutir'),
  ('Tremores', 'Movimentos involuntários e repetitivos de partes do corpo'),
  ('Palpitações', 'Sensação de batimentos cardíacos irregulares ou fortes'),
  ('Dor no peito', 'Desconforto torácico, podendo ser leve ou intenso'),
  ('Respiração ofegante', 'Respiração rápida e curta, associada a esforço respiratório'),
  ('Inchaço nos gânglios linfáticos', 'Aumento palpável dos linfonodos, geralmente no pescoço, axilas ou virilha'),
  ('Pele amarelada', 'Coloração amarela da pele e mucosas, comum em casos de icterícia'),
  ('Sensação de peso nas pernas', 'Desconforto ou fadiga nas pernas, principalmente ao final do dia'),
  ('Sudorese excessiva', 'Transpiração em excesso, mesmo em ambientes com temperaturas controladas'),
  ('Coceira na pele', 'Sensação de prurido que leva ao ato de coçar'),
  ('Rouquidão', 'Alteração na voz, tornando-a mais áspera ou fraca'),
  ('Sensação de opressão no peito', 'Sensação de peso ou pressão na região torácica'),
  ('Pele fria e úmida', 'Sensação tátil de frieza e suor na pele, comum em estados de choque térmico'),
  ('Dor nos olhos', 'Sensação dolorosa ou desconforto ocular'),
  ('Espasmos musculares', 'Contrações involuntárias e súbitas dos músculos'),
  ('Extremidades frias', 'Sensação de frio em mãos e pés, mesmo em ambiente aquecido'),
  ('Fraqueza extrema', 'Sensação intensa de cansaço e falta de energia para realizar atividades simples'),
  ('Letargia e/ou irritabilidade', 'Estado de sonolência excessiva ou mudança de humor com agitação ou irritação'),
  ('Taquicardia', 'Aumento da frequência dos batimentos cardíacos, geralmente acima de 100 bpm em repouso'),
  ('Confusão', 'Dificuldade para pensar com clareza, desorientação ou falta de atenção'),
  ('Palidez', 'Coloração mais clara da pele, especialmente no rosto, lábios ou mãos'),
  ('Sangue nas fezes', 'Presença de sangue visível nas evacuações, podendo ser vermelho vivo ou escuro'),
  ('Febre repentina', 'Aumento rápido da temperatura corporal, geralmente acompanhado de calafrios ou mal-estar'),
  ('Dor nas costas', 'Desconforto ou dor localizada na região posterior do tronco'),
  ('Convulsões', 'Movimentos corporais involuntários e descontrolados, geralmente acompanhados de perda de consciência'),
  ('Olhos amarelados', 'Coloração amarelada na parte branca dos olhos, geralmente associada a problemas no fígado'),
  ('Sangramento na pele', 'Pequenos pontos vermelhos ou manchas roxas na pele causadas por sangramentos sob a pele');
