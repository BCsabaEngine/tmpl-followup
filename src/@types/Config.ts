import { Static, TSchema, Type } from '@sinclair/typebox';

export const Config: TSchema = Type.Object({
    name: Type.String(),
    id: Type.Optional(Type.String()),
});

export type Config = Static<typeof Config>;
