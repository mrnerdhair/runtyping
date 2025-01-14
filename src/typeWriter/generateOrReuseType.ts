import { Type } from 'ts-morph'
import factory from './factory'
import TypeWriter from './TypeWriter'
import { DeclareAndUse } from './symbols'
import enumMemberTypeGenerator from './enumMember'

export default function* generateOrReuseType(type: Type): TypeWriter {
  const typeName =
    type.getAliasSymbol()?.getName() || type.getSymbol()?.getName()

  if (!!typeName) {
    if (type.isEnumLiteral())
      return yield* enumMemberTypeGenerator(type, typeName)
    else if (yield [DeclareAndUse, typeName]) return
  }

  yield* factory(type)
}
