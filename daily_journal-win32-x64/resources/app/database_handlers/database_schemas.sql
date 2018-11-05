CREATE TABLE categories (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL 
);

CREATE TABLE records (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    info VARCHAR(10000) NOT NULL,
    category_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
);

INSERT INTO categories
        (name)
VALUES
        ("education"),
        ("entertainment"),
        ("finance"),
        ("development"),
        ("medical");


SELECT *
FROM records
INNER JOIN categories
    ON records.category_id = categories.id
WHERE
    DATE(created_at) >= "2018-10-22" AND DATE(created_at) <= "2018-10-27"
ORDER BY created_at, categories.name DESC;



UPDATE records
SET     
    category_id = 5,
    info = "Just chill chill Just chill"
WHERE 
    id = 80;