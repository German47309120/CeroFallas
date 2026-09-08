import { configureProjectUsers, projectUserCatalogPath } from './configure-project-users.mjs'

const accounts = await configureProjectUsers()
console.log(`Matriz local preparada: ${accounts.length} cuentas institucionales actualizadas de forma idempotente.`)
console.log(`Fuente única de accesos: ${projectUserCatalogPath} (ignorada por Git).`)
