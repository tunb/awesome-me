# What Is SQLite
Summary: this tutorial gives you a brief overview of SQLite and the SQLite’s distinctive features that make SQLite the most widely deployed SQL database engine.

What is SQLite
SQLite is a software library that provides a relational database management system. The lite in SQLite means light weight in terms of setup, database administration, and required resource.

SQLite has the following noticeable features: self-contained, serverless, zero-configuration, transactional.

# References
  * [https://www.sqlite.org] – SQLite homepage
  * [https://www.sqlite.org/features.html] – SQLite features
  * [https://www.sqlite.org/copyright.html] – SQLite license
  * [https://www.sqlite.org/docs.html] – SQLite documentation
# SQLite Sample Database
There are 11 tables in the chinook sample database.

  * employees table stores employees data such as employee id, last name, first name, etc. It also has a field named ReportsTo to specify who reports to whom.
  * customers table stores customers data.
  * invoices & invoice_items tables: these two tables store invoice data. The invoices table stores invoice header data and the invoice_items table stores the invoice line items data.
  * artists table stores artists data. It is a simple table that contains only artist id and name.
  * albums table stores data about a list of tracks. Each album belongs to one artist. However, one artist may have multiple albums.
  * media_types table stores media types such as MPEG audio and AAC audio file.
  * genres table stores music types such as rock, jazz, metal, etc.
  * tracks table store the data of songs. Each track belongs to one album.
  * playlists & playlist_track tables: playlists table store data about playlists. Each playlist contains a list of tracks. Each track may belong to multiple playlists. The relationship
  * between the playlists table and tracks table is many-to-many. The playlist_track table is used to reflect this relationship.
## Download sample
  [http://www.sqlitetutorial.net/wp-content/uploads/2018/03/chinook.zip]

# TUTORIAL 
  [http://www.sqlitetutorial.net/sqlite-tutorial]
## SQLite Show Tables

Summary: in this tutorial, you will learn various ways to show tables from an SQLite database by using SQLite command line shell program or by querying data from sqlite_master tables.

```sql
SELECT 
    name
FROM 
    sqlite_master 
WHERE 
    type ='table' AND 
    name NOT LIKE 'sqlite_%';
```

## SQLite Describe Table
 
Summary: in this tutorial, you will learn about various ways to show the structure of a table in SQLite.

```sql
SELECT
    sql 
FROM 
    sqlite_master 
WHERE 
    name = 'albums';
```

## SQLite Select

Summary: in this tutorial, you will learn how to use SQLite SELECT statement to query data from a single table.

```sql
SELECT
 1 + 1;

SELECT DISTINCT column_list
FROM table_list
  JOIN table ON join_condition
WHERE row_filter
ORDER BY column
LIMIT count OFFSET offset
GROUP BY column
HAVING group_filter;

SELECT
 column_list
FROM
 table
ORDER BY
 column_1 ASC,
 column_2 DESC;

SELECT
    InvoiceId,
    BillingAddress,
    Total
FROM
    invoices
WHERE
    Total BETWEEN 14.91 and 18.86    
ORDER BY
    Total; 

CREATE TABLE ranks (
    rank TEXT NOT NULL
);
 
CREATE TABLE suits (
    suit TEXT NOT NULL
);
 
INSERT INTO ranks(rank) 
VALUES('2'),('3'),('4'),('5'),('6'),('7'),('8'),('9'),('10'),('J'),('Q'),('K'),('A');
 
INSERT INTO suits(suit) 
VALUES('Clubs'),('Diamonds'),('Hearts'),('Spades');

SELECT rank,
       suit
  FROM ranks
       CROSS JOIN
       suits
ORDER BY suit;


SELECT ArtistId
FROM artists
EXCEPT
SELECT ArtistId
FROM albums;


SELECT
 column_1
FROM
 table_1
WHERE
 column_1 = (SELECT column_1 FROM table_2);
```

## SQLite Modify data

```sql
CREATE TABLE test_datatypes (
 id INTEGER PRIMARY KEY,
 val
);

INSERT INTO test_datatypes (val)
VALUES
 (1),
 (2),
 (10.1),
 (20.5),
 ('A'),
 ('B'),
 (NULL),
 (x'0010'),
 (x'0011');

SELECT
 id,
 val,
 typeof(val)
FROM
 test_datatypes;


ALTER TABLE existing_table
RENAME TO new_table;

DROP TABLE [IF EXISTS] [schema_name.]table_name;

BEGIN TRANSACTION;
 
UPDATE accounts
   SET balance = balance - 1000
 WHERE account_no = 100;
 
UPDATE accounts
   SET balance = balance + 1000
 WHERE account_no = 200;
 
INSERT INTO account_changes(account_no,flag,amount,changed_at) 
values(100,'-',1000,datetime('now'));
 
INSERT INTO account_changes(account_no,flag,amount,changed_at) 
values(200,'+',1000,datetime('now'));
 
COMMIT;
ROLLBACK;


CREATE VIRTUAL TABLE posts 
USING FTS5(title, body);

SELECT * 
FROM posts 
WHERE posts MATCH 'fts5';

SELECT * 
FROM posts 
WHERE posts MATCH 'text' 
ORDER BY rank;

CREATE TRIGGER [IF NOT EXISTS] trigger_name 
   [BEFORE|AFTER|INSTEAD OF] [INSERT|UPDATE|DELETE] 
   ON table_name
   [WHEN condition]
BEGIN
 statements;
END;
```