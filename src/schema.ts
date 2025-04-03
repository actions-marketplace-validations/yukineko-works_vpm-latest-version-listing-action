import zod from 'zod'

export const ConfigSchema = zod.object({
    repositories: zod.array(
        zod.union([
            zod.string(),
            zod.object({
                repo: zod.string(),
                metadataPath: zod.string().optional(),
            }),
        ])
    ),
})

export const MetadataSchema = zod.object({
    name: zod.string(),
    group: zod.string().optional(),
})

export const PackageSchema = zod.object({
    name: zod.string(),
    displayName: zod.string().optional(),
    version: zod.string(),
    description: zod.string().optional(),
})
