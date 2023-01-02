import { Static, Type } from '@sinclair/typebox';

export const Config = Type.Object({
    templateFolder: Type.String(),
    templateId: Type.Optional(Type.String()),
    repoId: Type.Optional(Type.String()),
    exclude: Type.Array(Type.String(), { default: [] }),
    diffTool: Type.Optional(Type.String()),
    hiddenFiles: Type.Array(Type.Object({
        filename: Type.String(),
        hash: Type.String(),
    }), { default: [] }),

});

export type Config = Static<typeof Config>;

export const TemplateConfig = Type.Object({
    templateId: Type.Optional(Type.String()),
    exclude: Type.Optional(Type.Array(Type.String())),
});

export type TemplateConfig = Static<typeof TemplateConfig>;
