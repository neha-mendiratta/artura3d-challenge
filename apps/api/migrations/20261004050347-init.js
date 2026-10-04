'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Ids come from Postgres 18 uuidv7(): time-ordered, so new rows append to the end of the index.
    const id = { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuidv7()') };
    const now = { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') };
    const orderId = {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'orders', key: 'id' },
    };

    await queryInterface.createTable('orders', {
      id,
      patient_ref: { type: Sequelize.TEXT, allowNull: false },
      length_mm: { type: Sequelize.DECIMAL(4, 1), allowNull: false },
      width_mm: { type: Sequelize.DECIMAL(4, 1), allowNull: false },
      thickness_mm: { type: Sequelize.DECIMAL(3, 1), allowNull: false },
      colour: { type: Sequelize.TEXT, allowNull: false },
      expedite: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      notes: { type: Sequelize.TEXT },
      status: { type: Sequelize.ENUM('Draft', 'Submitted'), allowNull: false, defaultValue: 'Draft' },
      created_at: now,
      updated_at: now,
      submitted_at: { type: Sequelize.DATE },
    });
    // Orders list filtered by status, newest first.
    await queryInterface.addIndex('orders', ['status', 'id'], { name: 'orders_status_id_idx' });

    await queryInterface.createTable('quotes', {
      id,
      order_id: orderId,
      total_cents: { type: Sequelize.INTEGER, allowNull: false },
      created_at: now,
    });

    await queryInterface.createTable('manufacturing_packets', {
      id,
      order_id: orderId,
      status: {
        type: Sequelize.ENUM('Pending', 'Completed', 'Failed'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      payload: { type: Sequelize.JSONB },
      error: { type: Sequelize.TEXT },
      created_at: now,
      updated_at: now,
    });
    // Lets the worker find Pending packets without scanning completed ones.
    await queryInterface.addIndex('manufacturing_packets', ['status', 'id'], {
      name: 'manufacturing_packets_status_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('manufacturing_packets');
    await queryInterface.dropTable('quotes');
    await queryInterface.dropTable('orders');
    await queryInterface.dropEnum('enum_manufacturing_packets_status');
    await queryInterface.dropEnum('enum_orders_status');
  },
};
