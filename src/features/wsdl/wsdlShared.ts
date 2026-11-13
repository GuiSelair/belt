export const WSDL_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/"
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
  xmlns:soap12="http://schemas.xmlsoap.org/wsdl/soap12/"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:tns="urn:belt:orders"
  targetNamespace="urn:belt:orders">
  <wsdl:types>
    <xs:schema targetNamespace="urn:belt:orders" elementFormDefault="qualified">
      <xs:simpleType name="OrderStatus">
        <xs:restriction base="xs:string">
          <xs:enumeration value="OPEN"/>
          <xs:enumeration value="SHIPPED"/>
          <xs:enumeration value="CANCELLED"/>
        </xs:restriction>
      </xs:simpleType>
      <xs:complexType name="Item">
        <xs:sequence>
          <xs:element name="sku" type="xs:string"/>
          <xs:element name="quantity" type="xs:int"/>
        </xs:sequence>
        <xs:attribute name="gift" type="xs:boolean"/>
      </xs:complexType>
      <xs:element name="GetOrderRequest">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="orderId" type="xs:string"/>
            <xs:element name="includeItems" type="xs:boolean" minOccurs="0"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
      <xs:element name="GetOrderResponse">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="status" type="tns:OrderStatus"/>
            <xs:element name="item" type="tns:Item" minOccurs="0" maxOccurs="unbounded"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
      <xs:element name="CreateOrderRequest">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="customerId" type="xs:string"/>
            <xs:element name="item" type="tns:Item" maxOccurs="unbounded"/>
            <xs:element name="status" type="tns:OrderStatus" minOccurs="0"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
      <xs:element name="CreateOrderResponse">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="orderId" type="xs:string"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
      <xs:element name="AuthHeader">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="apiKey" type="xs:string"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
    </xs:schema>
  </wsdl:types>
  <wsdl:message name="GetOrderInput">
    <wsdl:part name="parameters" element="tns:GetOrderRequest"/>
  </wsdl:message>
  <wsdl:message name="GetOrderOutput">
    <wsdl:part name="parameters" element="tns:GetOrderResponse"/>
  </wsdl:message>
  <wsdl:message name="CreateOrderInput">
    <wsdl:part name="parameters" element="tns:CreateOrderRequest"/>
  </wsdl:message>
  <wsdl:message name="CreateOrderOutput">
    <wsdl:part name="parameters" element="tns:CreateOrderResponse"/>
  </wsdl:message>
  <wsdl:message name="AuthHeaderMessage">
    <wsdl:part name="auth" element="tns:AuthHeader"/>
  </wsdl:message>
  <wsdl:portType name="OrderPortType">
    <wsdl:operation name="GetOrder">
      <wsdl:documentation>Returns the status and items of an order.</wsdl:documentation>
      <wsdl:input message="tns:GetOrderInput"/>
      <wsdl:output message="tns:GetOrderOutput"/>
    </wsdl:operation>
    <wsdl:operation name="CreateOrder">
      <wsdl:input message="tns:CreateOrderInput"/>
      <wsdl:output message="tns:CreateOrderOutput"/>
    </wsdl:operation>
  </wsdl:portType>
  <wsdl:binding name="OrderSoapBinding" type="tns:OrderPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="GetOrder">
      <soap:operation soapAction="urn:belt:orders/GetOrder"/>
      <wsdl:input>
        <soap:header message="tns:AuthHeaderMessage" part="auth" use="literal"/>
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="CreateOrder">
      <soap:operation soapAction="urn:belt:orders/CreateOrder"/>
      <wsdl:input><soap:body use="literal"/></wsdl:input>
      <wsdl:output><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
  </wsdl:binding>
  <wsdl:binding name="OrderSoap12Binding" type="tns:OrderPortType">
    <soap12:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="GetOrder">
      <soap12:operation soapAction="urn:belt:orders/GetOrder"/>
      <wsdl:input><soap12:body use="literal"/></wsdl:input>
      <wsdl:output><soap12:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="CreateOrder">
      <soap12:operation soapAction="urn:belt:orders/CreateOrder"/>
      <wsdl:input><soap12:body use="literal"/></wsdl:input>
      <wsdl:output><soap12:body use="literal"/></wsdl:output>
    </wsdl:operation>
  </wsdl:binding>
  <wsdl:service name="OrderService">
    <wsdl:port name="OrderSoap" binding="tns:OrderSoapBinding">
      <soap:address location="https://api.belt.dev/soap/orders"/>
    </wsdl:port>
    <wsdl:port name="OrderSoap12" binding="tns:OrderSoap12Binding">
      <soap12:address location="https://api.belt.dev/soap12/orders"/>
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>`;
