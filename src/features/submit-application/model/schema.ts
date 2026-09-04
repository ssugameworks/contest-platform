// Re-exported from the entity layer so the server action can validate
// against the exact same schema the client form uses — see
// src/entities/application/model/schema.ts for the source of truth.
export {
  type ApplicationFormInput,
  applicationSchema,
  ROLE_OPTIONS,
} from "@/entities/application";
