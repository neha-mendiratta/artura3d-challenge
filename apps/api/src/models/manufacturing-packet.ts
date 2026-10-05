import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../db';
import { PacketStatus } from '@artura/shared';
import { idColumn } from './shared-columns';

export class ManufacturingPacket extends Model<
  InferAttributes<ManufacturingPacket>,
  InferCreationAttributes<ManufacturingPacket>
> {
  declare id: CreationOptional<string>;
  declare orderId: string;
  declare status: CreationOptional<PacketStatus>;
  declare payload: CreationOptional<object | null>;
  declare error: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ManufacturingPacket.init(
  {
    id: idColumn,
    orderId: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'Completed', 'Failed') },
    payload: { type: DataTypes.JSONB },
    error: { type: DataTypes.TEXT },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  { sequelize, tableName: 'manufacturing_packets', underscored: true },
);
