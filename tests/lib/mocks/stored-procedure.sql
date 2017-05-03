CREATE PROCEDURE client_age_less_than
(IN ryan bit, clientId int, age int, limitVal int, status varchar(20), offsetVal int)
BEGIN
SELECT age from clients c
WHERE CAST(c.clientId AS UNSIGNED) > clientId;
END
