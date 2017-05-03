CREATE PROCEDURE `testing`.e2e_sproc
(IN likeVal varchar(25))
BEGIN
show tables from mysql
where `Tables_in_mysql` like CONCAT('%', likeVal , '%');
END
