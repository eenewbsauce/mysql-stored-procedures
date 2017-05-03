CREATE PROCEDURE client_age_less_than
(IN clientId int)
BEGIN
SELECT age from `<%= environment %>-bi`.clients c
WHERE CAST(c.clientId AS UNSIGNED) > clientId;
END
