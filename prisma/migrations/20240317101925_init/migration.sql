-- CreateTable
CREATE TABLE `Student` (
    `rollNumber` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `branch` VARCHAR(191) NOT NULL,
    `batch` INTEGER NOT NULL,
    `role` ENUM('BTech', 'MTech', 'PhD') NOT NULL DEFAULT 'BTech',
    `canRequest` BOOLEAN NOT NULL DEFAULT false,
    `noDuesGiven` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Student_email_key`(`email`),
    PRIMARY KEY (`rollNumber`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `deptId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `autoApprove` BOOLEAN NOT NULL DEFAULT false,
    `pswdDept` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Department_username_key`(`username`),
    UNIQUE INDEX `Department_pswdDept_key`(`pswdDept`),
    PRIMARY KEY (`deptId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fines` (
    `fineId` VARCHAR(191) NOT NULL,
    `studentRollNumber` VARCHAR(191) NOT NULL,
    `departmentDeptId` VARCHAR(191) NOT NULL,
    `dateOfCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deadline` DATETIME(3) NOT NULL,
    `reason` VARCHAR(300) NOT NULL,
    `damageProof` VARCHAR(191) NULL,
    `status` ENUM('Approved', 'Pending', 'Rejected', 'Outstanding') NOT NULL DEFAULT 'Outstanding',

    PRIMARY KEY (`fineId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Requests` (
    `requestId` VARCHAR(191) NOT NULL,
    `studentRollNumber` VARCHAR(191) NOT NULL,
    `departmentDeptId` VARCHAR(191) NOT NULL,
    `dateOfRequest` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `dateOfApproval` DATETIME(3) NOT NULL,

    PRIMARY KEY (`requestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payments` (
    `paymentId` VARCHAR(191) NOT NULL,
    `paymentProof` VARCHAR(191) NOT NULL,
    `dateOfPayment` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finesFineId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`paymentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `adminId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `pswdAdmin` VARCHAR(191) NOT NULL,
    `isSuperAdmin` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Admin_username_key`(`username`),
    UNIQUE INDEX `Admin_pswdAdmin_key`(`pswdAdmin`),
    PRIMARY KEY (`adminId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Fines` ADD CONSTRAINT `Fines_studentRollNumber_fkey` FOREIGN KEY (`studentRollNumber`) REFERENCES `Student`(`rollNumber`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fines` ADD CONSTRAINT `Fines_departmentDeptId_fkey` FOREIGN KEY (`departmentDeptId`) REFERENCES `Department`(`deptId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Requests` ADD CONSTRAINT `Requests_studentRollNumber_fkey` FOREIGN KEY (`studentRollNumber`) REFERENCES `Student`(`rollNumber`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Requests` ADD CONSTRAINT `Requests_departmentDeptId_fkey` FOREIGN KEY (`departmentDeptId`) REFERENCES `Department`(`deptId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payments` ADD CONSTRAINT `Payments_finesFineId_fkey` FOREIGN KEY (`finesFineId`) REFERENCES `Fines`(`fineId`) ON DELETE RESTRICT ON UPDATE CASCADE;
