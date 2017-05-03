CREATE PROCEDURE client_age_less_than
(IN age int, clientId int, limit int, offset int, ryan bit, status varchar(20))
BEGIN
SELECT age from clients c
WHERE CAST(c.clientId AS UNSIGNED) > clientId;
END
