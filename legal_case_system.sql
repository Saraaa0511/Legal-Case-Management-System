CREATE DATABASE IF NOT EXISTS legal_case_system;
USE legal_case_system;

CREATE TABLE CLIENT (
    client_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100),
    email VARCHAR(50) UNIQUE,
    phone_no VARCHAR(15)
);

CREATE TABLE CASE_DETAILS (
    case_id INT PRIMARY KEY AUTO_INCREMENT,
    case_type VARCHAR(50),
    filing_date DATE,
    status VARCHAR(20) DEFAULT 'Open',
    client_id INT,
    FOREIGN KEY (client_id) REFERENCES CLIENT(client_id) ON DELETE CASCADE
);

CREATE TABLE LAWYER (
    lawyer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    phone_no VARCHAR(15),
    email VARCHAR(50) UNIQUE,
    specialization VARCHAR(50)
);

CREATE TABLE CASE_LAWYER (
    case_id INT,
    lawyer_id INT,
    PRIMARY KEY (case_id, lawyer_id),
    FOREIGN KEY (case_id) REFERENCES CASE_DETAILS(case_id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES LAWYER(lawyer_id) ON DELETE CASCADE
);

CREATE TABLE WITNESS (
    witness_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    contact_info VARCHAR(50),
    testimony TEXT
);

CREATE TABLE CASE_WITNESS (
    case_id INT,
    witness_id INT,
    PRIMARY KEY (case_id, witness_id),
    FOREIGN KEY (case_id) REFERENCES CASE_DETAILS(case_id) ON DELETE CASCADE,
    FOREIGN KEY (witness_id) REFERENCES WITNESS(witness_id) ON DELETE CASCADE
);

CREATE TABLE EVIDENCE (
    evidence_id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50),
    description TEXT,
    case_id INT,
    FOREIGN KEY (case_id) REFERENCES CASE_DETAILS(case_id) ON DELETE CASCADE
);

CREATE TABLE COURT_HEARING (
    hearing_id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE,
    time TIME,
    court_location VARCHAR(100),
    case_id INT,
    FOREIGN KEY (case_id) REFERENCES CASE_DETAILS(case_id) ON DELETE CASCADE
);

CREATE TABLE AUDIT_LOG (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    action VARCHAR(100),
    performed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO CLIENT (name, address, email, phone_no) VALUES
('Avni', 'Pune, MH', 'avni@gmail.com', '9876543210'),
('Aarushi', 'Mumbai, MH', 'aarushi@gmail.com', '9123456780'),
('Arya', 'Nagpur, MH', 'arya@gmail.com', '9988776655'),
('Sudipta', 'Nashik, MH', 'sudipta@gmail.com', '9112233445');

INSERT INTO LAWYER (name, phone_no, email, specialization) VALUES
('Aryan', '9871111111', 'aryan@lawfirm.com', 'Criminal Law'),
('Mitali Agarwal', '9872222222', 'mitali@lawfirm.com', 'Civil Law'),
('Vaishnavi Zavar', '9873333333', 'vaishnavi@lawfirm.com', 'Corporate Law');

INSERT INTO CASE_DETAILS (case_type, filing_date, status, client_id) VALUES
('Criminal', '2026-01-10', 'Open', 1),
('Civil', '2026-02-15', 'Closed', 2),
('Family', '2026-03-01', 'Pending', 3),
('Corporate', '2026-03-20', 'Open', 4);

INSERT INTO WITNESS (name, contact_info, testimony) VALUES
('Jai', '9999999999', 'Witnessed the incident'),
('Aniket', '8888888888', 'Provided documents'),
('Yahvi', '7777777777', 'Saw agreement signing');

INSERT INTO CASE_WITNESS VALUES
(1, 1),
(1, 2),
(2, 2),
(3, 3);

INSERT INTO EVIDENCE (type, description, case_id) VALUES
('Document', 'FIR copy', 1),
('Photo', 'Accident photos', 1),
('Document', 'Agreement papers', 2),
('Video', 'CCTV footage', 4);

INSERT INTO CASE_LAWYER VALUES
(1, 1),
(2, 2),
(3, 3),
(1, 2);

INSERT INTO COURT_HEARING (date, time, court_location, case_id) VALUES
('2026-04-01', '10:00:00', 'Pune Court', 1),
('2026-04-05', '12:00:00', 'Mumbai Court', 2),
('2026-04-10', '11:00:00', 'Nagpur Court', 3),
('2026-04-15', '14:00:00', 'Nashik Court', 4),
('2026-05-01', '10:30:00', 'Pune Court', 1);

UPDATE CASE_DETAILS
SET status = 'Closed'
WHERE case_id = 1;

SELECT * FROM CLIENT;

SELECT cd.case_id, c.name, cd.case_type, cd.status, cd.filing_date
FROM CASE_DETAILS cd
JOIN CLIENT c ON cd.client_id = c.client_id
WHERE cd.status = 'Open';

SELECT c.name, cd.case_type, l.name, l.specialization
FROM CASE_DETAILS cd
JOIN CLIENT c ON cd.client_id = c.client_id
JOIN CASE_LAWYER cl ON cd.case_id = cl.case_id
JOIN LAWYER l ON cl.lawyer_id = l.lawyer_id;

SELECT e.type, e.description
FROM EVIDENCE e
WHERE e.case_id = 1;

SELECT case_type, COUNT(*) 
FROM CASE_DETAILS
GROUP BY case_type;

SELECT ch.date, ch.time, ch.court_location, cd.case_type, c.name
FROM COURT_HEARING ch
JOIN CASE_DETAILS cd ON ch.case_id = cd.case_id
JOIN CLIENT c ON cd.client_id = c.client_id
WHERE ch.date >= CURDATE()
ORDER BY ch.date;

SELECT w.name, w.contact_info, w.testimony
FROM WITNESS w
JOIN CASE_WITNESS cw ON w.witness_id = cw.witness_id
WHERE cw.case_id = 1;
DELIMITER $$



CREATE PROCEDURE add_new_case(
    IN p_case_type VARCHAR(50),
    IN p_filing_date DATE,
    IN p_client_id INT
)
BEGIN

    IF EXISTS (
        SELECT 1
        FROM CLIENT
        WHERE client_id = p_client_id
    ) THEN

        INSERT INTO CASE_DETAILS
            (case_type, filing_date, status, client_id)
        VALUES
            (p_case_type, p_filing_date, 'Open', p_client_id);

        SELECT
            'Case added successfully' AS message,
            LAST_INSERT_ID() AS new_case_id;

    ELSE

        SELECT
            'Error: Client not found' AS message;

    END IF;

END$$



CREATE PROCEDURE assign_lawyer(
    IN p_case_id INT,
    IN p_lawyer_id INT
)
BEGIN

    INSERT IGNORE INTO CASE_LAWYER
        (case_id, lawyer_id)
    VALUES
        (p_case_id, p_lawyer_id);

    SELECT
        'Lawyer assigned successfully' AS message;

END$$



CREATE PROCEDURE close_case(
    IN p_case_id INT
)
BEGIN

    UPDATE CASE_DETAILS
    SET status = 'Closed'
    WHERE case_id = p_case_id;

    SELECT ROW_COUNT() AS rows_updated;

END$$



CREATE PROCEDURE get_case_summary(
    IN p_case_id INT
)
BEGIN

    -- Case and client information
    SELECT
        cd.case_id,
        cd.case_type,
        cd.status,
        cd.filing_date,
        c.name AS client_name,
        c.phone_no AS client_phone
    FROM CASE_DETAILS cd
    JOIN CLIENT c
        ON cd.client_id = c.client_id
    WHERE cd.case_id = p_case_id;


    -- Lawyer information
    SELECT
        l.name AS lawyer_name,
        l.specialization
    FROM CASE_LAWYER cl
    JOIN LAWYER l
        ON cl.lawyer_id = l.lawyer_id
    WHERE cl.case_id = p_case_id;


    -- Hearing information
    SELECT
        date,
        time,
        court_location
    FROM COURT_HEARING
    WHERE case_id = p_case_id
    ORDER BY date;

END$$




CREATE FUNCTION count_cases_for_client(
    p_client_id INT
)
RETURNS INT
DETERMINISTIC
BEGIN

    DECLARE total INT;

    SELECT COUNT(*)
    INTO total
    FROM CASE_DETAILS
    WHERE client_id = p_client_id;

    RETURN total;

END$$




CREATE TRIGGER after_case_insert
AFTER INSERT ON CASE_DETAILS
FOR EACH ROW
BEGIN

    INSERT INTO AUDIT_LOG (action)
    VALUES (
        CONCAT(
            'New case added: ID=',
            NEW.case_id,
            ', Type=',
            NEW.case_type,
            ', Client ID=',
            NEW.client_id
        )
    );

END$$




CREATE TRIGGER before_case_update
BEFORE UPDATE ON CASE_DETAILS
FOR EACH ROW
BEGIN

    IF NEW.status NOT IN ('Open', 'Closed', 'Pending') THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
        'Invalid status. Use: Open, Closed, or Pending';

    END IF;

END$$


DELIMITER ;



CALL add_new_case('Civil', '2026-06-01', 2);

CALL assign_lawyer(3, 2);

CALL close_case(3);

CALL get_case_summary(1);

SELECT count_cases_for_client(1)
AS total_cases_for_client1;

SELECT * FROM AUDIT_LOG;