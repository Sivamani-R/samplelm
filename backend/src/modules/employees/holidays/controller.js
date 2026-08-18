import { query } from '../../../shared/database/index.js';
export const getHolidays = async (req, res, next) => { 
  try {
    const { location_id } = req.user;
    // We need location_id. Let's assume it's added to user object by authenticate or we query it
    const { rows: userRows } = await query('SELECT location_id FROM users WHERE id = $1', [req.user.sub]);
    const locId = userRows[0]?.location_id;
    const { rows } = await query('SELECT * FROM holidays WHERE location_id = $1', [locId]);
    res.json(rows);
  } catch(e) { next(e); }
};
