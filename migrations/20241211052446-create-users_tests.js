'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users_tests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      testId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      score: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      tryingCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add a unique constraint to prevent duplicate user-test combinations
    // await queryInterface.addConstraint('users_tests', {
    //   fields: ['userId', 'testId'],
    //   type: 'unique',
    //   name: 'unique_user_tests'
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_tests');
  }
};