import { z } from "zod";
import { ASSIGNABLE_ROLES } from "@/types/programmeDoc";

export const assignableRoleEnum = z.enum(ASSIGNABLE_ROLES);

export const resourceTypeEnum = z.enum(["video", "pdf", "link", "quiz"]);

const mcqQuestionSchema = z
  .object({
    mcqId: z.string().optional(),
    question: z.string().min(1, "Question is required"),
    options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least two options are required"),
    answer: z.number().int().min(0),
  })
  .refine((q) => q.answer < q.options.length, {
    message: "Select a correct answer",
    path: ["answer"],
  });

const lessonItemSchema = z.object({
  resourceId: z.string().optional(),
  type: z.enum(["video", "pdf", "link"]),
  title: z.string().min(1, "Title is required"),
  url: z.string().trim().min(1, "A URL is required"),
});

const quizItemSchema = z.object({
  resourceId: z.string().optional(),
  type: z.literal("quiz"),
  title: z.string().min(1, "Title is required"),
  questions: z.array(mcqQuestionSchema).min(1, "A quiz needs at least one question"),
});

const moduleItemSchema = z.discriminatedUnion("type", [lessonItemSchema, quizItemSchema]);

const programmeModuleSchema = z.object({
  moduleId: z.string().optional(),
  title: z.string().min(1, "Module title is required"),
  items: z.array(moduleItemSchema).min(1, "A module needs at least one item"),
});

const writtenQuestionSchema = z.object({
  questionId: z.string().optional(),
  question: z.string().min(1, "Question is required"),
});


export const programmeWriteSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    instructorIds: z.array(z.string()).default([]),
    modules: z.array(programmeModuleSchema).default([]),
    writtenTest: z.array(writtenQuestionSchema).default([]),
    roles: z.array(assignableRoleEnum).min(1, "Select at least one type"),
    isInternal: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.isInternal) {
      if (data.roles.includes("Consultant")) {
        ctx.addIssue({
          code: "custom",
          message: "Internal programmes can't be assigned the Consultant type",
          path: ["roles"],
        });
      }
    } else if (data.roles.some((r) => r !== "Consultant")) {
      ctx.addIssue({
        code: "custom",
        message: "Consultant programmes can only be assigned the Consultant type",
        path: ["roles"],
      });
    }
  });

export type ProgrammeWriteInput = z.infer<typeof programmeWriteSchema>;
