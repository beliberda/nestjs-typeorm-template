'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_roles', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                unique: true
            },
            roleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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
            }
        });

        // Add a unique constraint to prevent duplicate user-role combinations
        await queryInterface.addConstraint('user_roles', {
            fields: ['userId', 'roleId'],
            type: 'unique',
            name: 'unique_user_role'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('user_roles');
    }
};