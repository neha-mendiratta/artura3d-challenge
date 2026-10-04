import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../db';
import { idColumn } from './shared-columns';

export class Quote extends Model<InferAttributes<Quote>, InferCreationAttributes<Quote>> {
  declare id: CreationOptional<string>;
  declare orderId: string;
  declare totalCents: number;
  declare createdAt: CreationOptional<Date>;
}

Quote.init(
  {
    id: idColumn,
    orderId: { type: DataTypes.UUID, allowNull: false },
    totalCents: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: { type: DataTypes.DATE },
  },
  { sequelize, tableName: 'quotes', underscored: true, updatedAt: false },
);
