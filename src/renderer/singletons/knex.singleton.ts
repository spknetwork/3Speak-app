import Knex from 'knex'
import { HIVESQL_PASSWORD, HIVESQL_USERNAME } from '../../consts'

export const knex = Knex({
  client: 'mssql',
  connection: {
    host: 'vip.hivesql.io',
    user: HIVESQL_USERNAME,
    password: HIVESQL_PASSWORD,
    database: 'DBHive',
  },
  pool: {
    max: 7,
    min: 3,
  },
})
