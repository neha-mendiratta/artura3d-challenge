import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';
import { sequelize } from '../db';
import { OrderStatus } from '@artura/shared';
import type { Quote } from './quote';
import { decimalColumn, idColumn } from './shared-columns';

export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare id: CreationOptional<string>;
  declare patientRef: string;
  declare lengthMm: number;
  declare widthMm: number;
  declare thicknessMm: number;
  declare colour: string;
  declare expedite: CreationOptional<boolean>;
  declare notes: CreationOptional<string | null>;
  declare status: CreationOptional<OrderStatus>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare submittedAt: CreationOptional<Date | null>;
  declare quote?: NonAttribute<Quote | null>;
}

// status and expedite defaults live in the database; Sequelize sets createdAt and updatedAt.
Order.init(
  {
    id: idColumn,
    patientRef: { type: DataTypes.TEXT, allowNull: false },
    lengthMm: decimalColumn('lengthMm', 4, 1),
    widthMm: decimalColumn('widthMm', 4, 1),
    thicknessMm: decimalColumn('thicknessMm', 3, 1),
    colour: { type: DataTypes.TEXT, allowNull: false },
    expedite: { type: DataTypes.BOOLEAN },
    notes: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('Draft', 'Submitted') },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
    submittedAt: { type: DataTypes.DATE },
  },
  { sequelize, tableName: 'orders', underscored: true },
);
