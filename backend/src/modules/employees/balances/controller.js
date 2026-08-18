import { balanceService } from './../../leave-balances/service.js';
import { query } from '../../../shared/database/index.js';

export const getBalances = async (req, res, next) => { 
  try {
    const { sub: employeeId } = req.user;
    const { rows } = await query('SELECT location_id FROM users WHERE id = $1', [employeeId]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    const locationId = rows[0].location_id;

    const balances = await balanceService.getBalancesForEmployee(employeeId, locationId);
    res.json(balances);
  } catch (error) {
    next(error);
  }
};
