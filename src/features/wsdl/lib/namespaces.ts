export const WSDL_NS = 'http://schemas.xmlsoap.org/wsdl/';
export const WSDL2_NS = 'http://www.w3.org/ns/wsdl';
export const SOAP11_BINDING_NS = 'http://schemas.xmlsoap.org/wsdl/soap/';
export const SOAP12_BINDING_NS = 'http://schemas.xmlsoap.org/wsdl/soap12/';
export const XSD_NS = 'http://www.w3.org/2001/XMLSchema';

export type SoapVersion = '1.1' | '1.2';

export const SOAP_ENVELOPE: Record<
  SoapVersion,
  { ns: string; prefix: string; contentType: string }
> = {
  '1.1': {
    ns: 'http://schemas.xmlsoap.org/soap/envelope/',
    prefix: 'soapenv',
    contentType: 'text/xml; charset=utf-8',
  },
  '1.2': {
    ns: 'http://www.w3.org/2003/05/soap-envelope',
    prefix: 'soap',
    contentType: 'application/soap+xml; charset=utf-8',
  },
};
