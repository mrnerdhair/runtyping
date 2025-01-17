import { SymbolFlags, Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import TypeWriter from './TypeWriter'
import { Import, Write } from './symbols'

export default function* objectTypeGenerator(type: Type): TypeWriter {
  const isBuiltInType = type
    .getSymbolOrThrow()
    .getDeclarations()
    .some((d) =>
      d.getSourceFile().getFilePath().includes(require.resolve('typescript'))
    )

  if (isBuiltInType) return yield* generateBuildInType(type)
  else if (type.getStringIndexType())
    return yield* generateStringIndexType(type)
  else if (type.getNumberIndexType())
    return yield* generateNumberIndexType(type)

  yield [Import, 'Record']
  yield [Write, 'Record({']

  for (const property of type.getProperties()) {
    yield [Write, `${property.getName()}:`]
    const propertyType = property.getValueDeclarationOrThrow().getType()
    yield* generateOrReuseType(propertyType)
    if (property.hasFlags(SymbolFlags.Optional)) yield [Write, '.optional()']
    yield [Write, ',']
  }

  yield [Write, '})']
}

function* generateBuildInType(type: Type): TypeWriter {
  yield [Import, 'InstanceOf']
  yield [Write, `InstanceOf(${type.getText()})`]
}

function* generateStringIndexType(type: Type): TypeWriter {
  yield [Import, 'Dictionary']
  yield [Import, 'String']
  yield [Write, 'Dictionary(']
  yield* generateOrReuseType(type.getStringIndexType()!)
  yield [Write, ', String)']
}

function* generateNumberIndexType(type: Type): TypeWriter {
  yield [Import, 'Dictionary']
  yield [Import, 'Number']
  yield [Write, 'Dictionary(']
  yield* generateOrReuseType(type.getNumberIndexType()!)
  yield [Write, ', Number)']
}
