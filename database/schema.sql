CREATE DATABASE tutoreezyy;

USE tutoreezyy;

-- USERS
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    isTeaching BOOLEAN DEFAULT FALSE,
    isAdmin BOOLEAN DEFAULT FALSE,
    newUser BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TEACHER DETAILS (added rating)
CREATE TABLE teacher_details (
    user_id VARCHAR(36) PRIMARY KEY,
    experience INT,
    qualification VARCHAR(255),
    bio TEXT,
    hourly_rate DECIMAL(10,2),
    rating DECIMAL(2,1) DEFAULT 0.0, -- ⭐ added

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- STUDENT DETAILS
CREATE TABLE student_details (
    user_id VARCHAR(36) PRIMARY KEY,
    grade VARCHAR(50),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- TEACHER SUBJECTS (added UNIQUE constraint)
CREATE TABLE teacher_subjects (
    id VARCHAR(36) PRIMARY KEY,
    teacher_id VARCHAR(36) NOT NULL,
    subject VARCHAR(100) NOT NULL,

    UNIQUE (teacher_id, subject), -- 🔥 prevents duplicates

    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CLASSES (added ON DELETE CASCADE)
CREATE TABLE classes (
    id VARCHAR(36) PRIMARY KEY,

    teacher_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,

    subject VARCHAR(100) NOT NULL,

    status ENUM('pending','accepted','rejected') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- TEACHER SLOTS
CREATE TABLE teacher_slots (
    id VARCHAR(36) PRIMARY KEY,

    teacher_id VARCHAR(36) NOT NULL,

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    day_of_week VARCHAR(10),

    class_id VARCHAR(36), -- NULL = free

    status ENUM('free', 'pending', 'booked') DEFAULT 'free',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE reviews (
    id VARCHAR(36) PRIMARY KEY,

    teacher_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,

    class_id VARCHAR(36), -- optional (review for a class)

    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,

    UNIQUE (teacher_id, student_id, class_id) -- prevents duplicate review per class
);