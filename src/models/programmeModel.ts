import mongoose, { Schema } from "mongoose";
import { ASSIGNABLE_ROLES, type Programme } from "@/types/programmeDoc";

const genId = () => crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();

const McqQuestionSchema = new Schema(
  {
    mcqId: { type: String, default: genId },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: Number, required: true },
  },
  { _id: false }
);

const ModuleItemSchema = new Schema(
  {
    resourceId: { type: String, default: genId },
    type: { type: String, required: true, enum: ["video", "pdf", "link", "quiz"] },
    title: { type: String, required: true },
    url: { type: String, default: null },
    questions: { type: [McqQuestionSchema], default: undefined },
  },
  { _id: false }
);

const ProgrammeModuleSchema = new Schema(
  {
    moduleId: { type: String, default: genId },
    title: { type: String, required: true },
    items: { type: [ModuleItemSchema], default: [] },
  },
  { _id: false }
);

const WrittenQuestionSchema = new Schema(
  {
    questionId: { type: String, default: genId },
    question: { type: String, required: true },
  },
  { _id: false }
);

const ProgrammeSchema = new Schema<Programme>(
  {
    programmeId: {
      type: String,
      unique: true,
      default: genId,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    instructorIds: { type: [String], default: [] },
    modules: { type: [ProgrammeModuleSchema], default: [] },
    writtenTest: { type: [WrittenQuestionSchema], default: [] },
    roles: {
      type: [String],
      enum: ASSIGNABLE_ROLES,
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "At least one role is required",
      },
    },
    isInternal: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, collection: "Programmes" }
);

export default mongoose.models.Programme || mongoose.model<Programme>("Programme", ProgrammeSchema);
