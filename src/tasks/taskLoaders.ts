import type {
  ConvertBase64Request,
  ConvertBase64Result,
} from '@/features/base64/lib/convertBase64';
import type {
  FormatJsonRequest,
  FormatJsonResult,
} from '@/features/json/lib/formatJson';
import type {
  GenerateJsonSchemaRequest,
  GenerateJsonSchemaResult,
} from '@/features/json/lib/schema/generateJsonSchema';
import type { ValidateJsonResult } from '@/features/json/lib/validateJson';
import type {
  FormatJsxRequest,
  FormatJsxResult,
} from '@/features/jsx/lib/formatJsx';
import type { InspectJwtResult } from '@/features/jwt/lib/inspectJwt';
import type {
  AddAliasesRequest,
  AddAliasesResult,
} from '@/features/sql/aliases/lib/addAliases';
import type {
  ValidateSqlRequest,
  ValidateSqlResult,
} from '@/features/sql/lib/validateSql';
import type { InspectWsdlResult } from '@/features/wsdl/lib/inspectWsdl';
import type {
  BeautifyXmlDocumentResult,
  BeautifyXmlRequest,
} from '@/features/xml/lib/beautifyXmlDocument';
import type { XmlValidationResult } from '@/features/xml/lib/validateXml';
import type {
  GenerateXsdRequest,
  GenerateXsdResult,
} from '@/features/xml/lib/xsd/generateXsd';

interface Task<Payload, Result> {
  payload: Payload;
  result: Result;
}

export interface TaskMap {
  formatJson: Task<FormatJsonRequest, FormatJsonResult>;
  validateJson: Task<string, ValidateJsonResult>;
  generateJsonSchema: Task<GenerateJsonSchemaRequest, GenerateJsonSchemaResult>;
  formatJsx: Task<FormatJsxRequest, FormatJsxResult>;
  beautifyXml: Task<BeautifyXmlRequest, BeautifyXmlDocumentResult>;
  validateXml: Task<string, XmlValidationResult>;
  generateXsd: Task<GenerateXsdRequest, GenerateXsdResult>;
  inspectWsdl: Task<string, InspectWsdlResult>;
  warmSqlParser: Task<null, null>;
  validateSql: Task<ValidateSqlRequest, ValidateSqlResult>;
  addAliases: Task<AddAliasesRequest, AddAliasesResult>;
  inspectJwt: Task<string, InspectJwtResult>;
  convertBase64: Task<ConvertBase64Request, ConvertBase64Result>;
}

export type TaskName = keyof TaskMap;
export type TaskPayload<Name extends TaskName> = TaskMap[Name]['payload'];
export type TaskResult<Name extends TaskName> = TaskMap[Name]['result'];

type TaskHandler<Name extends TaskName> = (
  payload: TaskPayload<Name>,
) => TaskResult<Name> | Promise<TaskResult<Name>>;

/** Each tool's code is imported the first time one of its tasks runs. */
export const taskLoaders: {
  [Name in TaskName]: () => Promise<TaskHandler<Name>>;
} = {
  formatJson: () =>
    import('@/features/json/lib/formatJson').then((m) => m.formatJson),
  validateJson: () =>
    import('@/features/json/lib/validateJson').then((m) => m.validateJson),
  generateJsonSchema: () =>
    import('@/features/json/lib/schema/generateJsonSchema').then(
      (m) => m.generateJsonSchema,
    ),
  formatJsx: () =>
    import('@/features/jsx/lib/formatJsx').then((m) => m.formatJsx),
  beautifyXml: () =>
    import('@/features/xml/lib/beautifyXmlDocument').then(
      (m) => m.beautifyXmlDocument,
    ),
  validateXml: () =>
    import('@/features/xml/lib/validateXml').then((m) => m.validateXml),
  generateXsd: () =>
    import('@/features/xml/lib/xsd/generateXsd').then((m) => m.generateXsd),
  inspectWsdl: () =>
    import('@/features/wsdl/lib/inspectWsdl').then((m) => m.inspectWsdl),
  warmSqlParser: () =>
    import('@/features/sql/lib/loadSqlParser').then((m) => m.warmSqlParser),
  validateSql: () =>
    import('@/features/sql/lib/validateSql').then((m) => m.validateSql),
  addAliases: () =>
    import('@/features/sql/aliases/lib/addAliases').then((m) => m.addAliases),
  inspectJwt: () =>
    import('@/features/jwt/lib/inspectJwt').then((m) => m.inspectJwt),
  convertBase64: () =>
    import('@/features/base64/lib/convertBase64').then((m) => m.convertBase64),
};
