import { describe, expect, it } from 'vitest';

import { WSDL_SAMPLE } from '../wsdlShared';
import { inspectWsdl } from './inspectWsdl';

function inspect(text: string) {
  const result = inspectWsdl(text);
  if (!result.ok) throw new Error(JSON.stringify(result));
  return result;
}

function definitions(body: string, extraNamespaces = '') {
  return `<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
  xmlns:soap12="http://schemas.xmlsoap.org/wsdl/soap12/"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:tns="urn:test" targetNamespace="urn:test" ${extraNamespaces}>${body}</definitions>`;
}

describe('inspectWsdl', () => {
  it('lists every SOAP port with its binding and endpoint', () => {
    const { ports, targetNamespace } = inspect(WSDL_SAMPLE);

    expect(targetNamespace).toBe('urn:belt:orders');
    expect(
      ports.map(({ id, address, binding }) => ({
        id,
        address,
        name: binding.name,
        version: binding.soapVersion,
        style: binding.style,
        contentType: binding.contentType,
      })),
    ).toEqual([
      {
        id: 'OrderService/OrderSoap',
        address: 'https://api.belt.dev/soap/orders',
        name: 'OrderSoapBinding',
        version: '1.1',
        style: 'document',
        contentType: 'text/xml; charset=utf-8',
      },
      {
        id: 'OrderService/OrderSoap12',
        address: 'https://api.belt.dev/soap12/orders',
        name: 'OrderSoap12Binding',
        version: '1.2',
        style: 'document',
        contentType: 'application/soap+xml; charset=utf-8',
      },
    ]);
  });

  it('describes the operations of a binding', () => {
    const [soap11] = inspect(WSDL_SAMPLE).ports;

    expect(
      soap11.operations.map(({ name, soapAction, documentation }) => ({
        name,
        soapAction,
        documentation,
      })),
    ).toEqual([
      {
        name: 'GetOrder',
        soapAction: 'urn:belt:orders/GetOrder',
        documentation: 'Returns the status and items of an order.',
      },
      {
        name: 'CreateOrder',
        soapAction: 'urn:belt:orders/CreateOrder',
        documentation: null,
      },
    ]);
  });

  it('builds a document/literal SOAP 1.1 envelope with headers', () => {
    const [soap11] = inspect(WSDL_SAMPLE).ports;

    expect(soap11.operations[0].envelope).toBe(
      [
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="urn:belt:orders">',
        '  <soapenv:Header>',
        '    <tns:AuthHeader>',
        '      <tns:apiKey>?</tns:apiKey>',
        '    </tns:AuthHeader>',
        '  </soapenv:Header>',
        '  <soapenv:Body>',
        '    <tns:GetOrderRequest>',
        '      <tns:orderId>?</tns:orderId>',
        '      <!--Optional:-->',
        '      <tns:includeItems>?</tns:includeItems>',
        '    </tns:GetOrderRequest>',
        '  </soapenv:Body>',
        '</soapenv:Envelope>',
      ].join('\n'),
    );
  });

  it('expands named types, repetitions, enumerations and attributes', () => {
    const [, soap12] = inspect(WSDL_SAMPLE).ports;

    expect(soap12.operations[1].envelope).toBe(
      [
        '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tns="urn:belt:orders">',
        '  <soap:Header/>',
        '  <soap:Body>',
        '    <tns:CreateOrderRequest>',
        '      <tns:customerId>?</tns:customerId>',
        '      <!--1 or more repetitions:-->',
        '      <tns:item gift="?">',
        '        <tns:sku>?</tns:sku>',
        '        <tns:quantity>?</tns:quantity>',
        '      </tns:item>',
        '      <!--Optional:-->',
        '      <!--Allowed values: OPEN, SHIPPED, CANCELLED-->',
        '      <tns:status>?</tns:status>',
        '    </tns:CreateOrderRequest>',
        '  </soap:Body>',
        '</soap:Envelope>',
      ].join('\n'),
    );
  });

  it('wraps RPC parts in an element named after the operation', () => {
    const { ports } = inspect(
      definitions(`
  <message name="AddInput">
    <part name="a" type="xsd:int"/>
    <part name="b" type="xsd:int"/>
  </message>
  <portType name="Calc"><operation name="Add"><input message="tns:AddInput"/></operation></portType>
  <binding name="CalcBinding" type="tns:Calc">
    <soap12:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="Add">
      <soap12:operation soapAction=""/>
      <input><soap12:body use="literal" namespace="urn:calc"/></input>
    </operation>
  </binding>
  <service name="CalcService">
    <port name="CalcPort" binding="tns:CalcBinding">
      <soap12:address location="http://localhost/calc"/>
    </port>
  </service>`),
    );

    expect(ports[0].binding.style).toBe('rpc');
    expect(ports[0].operations[0].soapAction).toBe('');
    expect(ports[0].operations[0].envelope).toBe(
      [
        '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ns1="urn:calc">',
        '  <soap:Header/>',
        '  <soap:Body>',
        '    <ns1:Add>',
        '      <a>?</a>',
        '      <b>?</b>',
        '    </ns1:Add>',
        '  </soap:Body>',
        '</soap:Envelope>',
      ].join('\n'),
    );
  });

  it('stops expanding recursive types and shows choices', () => {
    const { ports } = inspect(
      definitions(`
  <types>
    <xsd:schema targetNamespace="urn:test">
      <xsd:complexType name="Node">
        <xsd:sequence>
          <xsd:choice>
            <xsd:element name="label" type="xsd:string"/>
            <xsd:element name="code" type="xsd:int"/>
          </xsd:choice>
          <xsd:element name="child" type="tns:Node" minOccurs="0"/>
        </xsd:sequence>
      </xsd:complexType>
      <xsd:element name="Tree" type="tns:Node"/>
    </xsd:schema>
  </types>
  <message name="In"><part name="body" element="tns:Tree"/></message>
  <portType name="P"><operation name="Send"><input message="tns:In"/></operation></portType>
  <binding name="B" type="tns:P">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="Send"><input><soap:body use="literal"/></input></operation>
  </binding>
  <service name="S"><port name="SP" binding="tns:B"><soap:address location="http://x"/></port></service>`),
    );

    expect(ports[0].operations[0].envelope).toContain(
      [
        '    <tns:Tree>',
        '      <!--You have a CHOICE of the next 2 items at this level-->',
        '      <label>?</label>',
        '      <code>?</code>',
        '      <!--Optional:-->',
        '      <!--Recursive type, not expanded further-->',
        '      <child/>',
        '    </tns:Tree>',
      ].join('\n'),
    );
  });

  it('includes the content of base types and referenced groups', () => {
    const { ports } = inspect(
      definitions(`
  <types>
    <xsd:schema targetNamespace="urn:test" elementFormDefault="qualified">
      <xsd:group name="Audit">
        <xsd:sequence><xsd:element name="createdAt" type="xsd:dateTime"/></xsd:sequence>
      </xsd:group>
      <xsd:complexType name="Base">
        <xsd:sequence><xsd:element name="id" type="xsd:long"/></xsd:sequence>
      </xsd:complexType>
      <xsd:complexType name="Customer">
        <xsd:complexContent>
          <xsd:extension base="tns:Base">
            <xsd:sequence>
              <xsd:element name="name" type="xsd:string"/>
              <xsd:group ref="tns:Audit"/>
            </xsd:sequence>
          </xsd:extension>
        </xsd:complexContent>
      </xsd:complexType>
      <xsd:element name="SaveCustomer" type="tns:Customer"/>
    </xsd:schema>
  </types>
  <message name="In"><part name="body" element="tns:SaveCustomer"/></message>
  <portType name="P"><operation name="Save"><input message="tns:In"/></operation></portType>
  <binding name="B" type="tns:P">
    <soap:binding/>
    <operation name="Save"><input><soap:body use="literal"/></input></operation>
  </binding>
  <service name="S"><port name="SP" binding="tns:B"><soap:address location="http://x"/></port></service>`),
    );

    expect(ports[0].operations[0].envelope).toContain(
      [
        '    <tns:SaveCustomer>',
        '      <tns:id>?</tns:id>',
        '      <tns:name>?</tns:name>',
        '      <tns:createdAt>?</tns:createdAt>',
        '    </tns:SaveCustomer>',
      ].join('\n'),
    );
  });

  it('warns about external schemas and unresolved types', () => {
    const result = inspect(
      definitions(`
  <types>
    <xsd:schema targetNamespace="urn:test">
      <xsd:import namespace="urn:other" schemaLocation="other.xsd"/>
    </xsd:schema>
  </types>
  <message name="In"><part name="body" element="tns:Missing"/></message>
  <portType name="P"><operation name="Send"><input message="tns:In"/></operation></portType>
  <binding name="B" type="tns:P">
    <soap:binding/>
    <operation name="Send"><input><soap:body use="literal"/></input></operation>
  </binding>`),
    );

    expect(result.notices).toEqual([
      'External schema "other.xsd" is not loaded; types defined there are shown as "?".',
      'No service is defined, so the endpoint URL is unknown.',
      'Some types could not be found in the WSDL (for example {urn:test}Missing); they are shown as "?".',
    ]);
    expect(result.ports[0].address).toBeNull();
    expect(result.ports[0].operations[0].envelope).toContain(
      '<tns:Missing>?</tns:Missing>',
    );
  });

  it('reports malformed XML with its position', () => {
    const result = inspectWsdl('<definitions>\n  <message>\n</definitions>');

    expect(result.ok).toBe(false);
    expect(!result.ok && result.kind).toBe('syntax');
  });

  it('rejects documents that are not WSDL 1.1', () => {
    expect(inspectWsdl('<root/>')).toEqual({
      ok: false,
      kind: 'wsdl',
      message:
        'This is not a WSDL document: the root element must be wsdl:definitions.',
    });
    expect(
      inspectWsdl('<description xmlns="http://www.w3.org/ns/wsdl"/>'),
    ).toMatchObject({ kind: 'wsdl', message: expect.stringMatching(/2\.0/) });
  });

  it('requires at least one SOAP binding', () => {
    expect(inspectWsdl(definitions('<binding name="Http"/>'))).toEqual({
      ok: false,
      kind: 'wsdl',
      message: 'No SOAP binding was found in this WSDL.',
    });
  });
});
