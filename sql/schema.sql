CREATE DATABASE top_songsDB;
USE top_songsDB;

CREATE TABLE Top5000(
 id INT NOT NULL AUTO_INCREMENT,
 PRIMARY KEY(id),
 artist VARCHAR(100),
 title VARCHAR(100),
 release_year INT(10),
 raw_total FLOAT(10),
 raw_USA FLOAT(10),
 raw_UK FLOAT(10),
 raw_EU FLOAT(10),
 raw_rest FLOAT(10)
);

CREATE TABLE TopAlbums(
	id INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY(id),
  artist VARCHAR(100),
  album_title VARCHAR(100),
  release_year INT(10),
	raw_total FLOAT(10),
	raw_USA FLOAT(10),
  raw_UK FLOAT(10),
  raw_EU FLOAT(10),
  raw_rest FLOAT(10)
);
  
DROP TABLE Top5000;