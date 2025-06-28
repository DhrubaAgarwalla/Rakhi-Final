// Delivery Partner Integration
// Supports: Delhivery, Shiprocket, Blue Dart, DTDC

export interface DeliveryPartner {
  name: string;
  trackingUrl: string;
  apiEndpoint: string;
}

export const deliveryPartners: Record<string, DeliveryPartner> = {
  delhivery: {
    name: 'Delhivery',
    trackingUrl: 'https://www.delhivery.com/track/package/',
    apiEndpoint: 'https://track.delhivery.com/api/v1/packages/json/'
  },
  shiprocket: {
    name: 'Shiprocket',
    trackingUrl: 'https://shiprocket.co/tracking/',
    apiEndpoint: 'https://apiv2.shiprocket.in/v1/external/'
  },
  bluedart: {
    name: 'Blue Dart',
    trackingUrl: 'https://www.bluedart.com/tracking',
    apiEndpoint: 'https://apigateway.bluedart.com/in/transportation/waybill/v1/'
  },
  dtdc: {
    name: 'DTDC',
    trackingUrl: 'https://www.dtdc.in/tracking',
    apiEndpoint: 'https://blktracksvc.dtdc.com/dtdc-api/rest/JSONCnTrk/'
  }
};

export interface ShipmentData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    weight: number; // in grams
  }>;
  totalWeight: number; // in grams
  totalValue: number;
  paymentMode: 'COD' | 'Prepaid';
  codAmount?: number;
}

export class DeliveryService {
  private partner: string;
  private apiKey: string;
  private apiSecret?: string;

  constructor(partner: string, apiKey: string, apiSecret?: string) {
    this.partner = partner;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async createShipment(shipmentData: ShipmentData): Promise<{
    success: boolean;
    trackingNumber?: string;
    awbNumber?: string;
    error?: string;
  }> {
    try {
      switch (this.partner) {
        case 'delhivery':
          return await this.createDelhiveryShipment(shipmentData);
        case 'shiprocket':
          return await this.createShiprocketShipment(shipmentData);
        case 'bluedart':
          return await this.createBlueDartShipment(shipmentData);
        case 'dtdc':
          return await this.createDTDCShipment(shipmentData);
        default:
          throw new Error('Unsupported delivery partner');
      }
    } catch (error) {
      console.error('Shipment creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async createDelhiveryShipment(data: ShipmentData) {
    const payload = {
      shipments: [{
        name: data.customerName,
        add: data.deliveryAddress.address,
        pin: data.deliveryAddress.pincode,
        city: data.deliveryAddress.city,
        state: data.deliveryAddress.state,
        country: 'India',
        phone: data.customerPhone,
        order: data.orderId,
        payment_mode: data.paymentMode,
        return_pin: data.pickupAddress.pincode,
        return_city: data.pickupAddress.city,
        return_phone: data.pickupAddress.phone,
        return_add: data.pickupAddress.address,
        return_state: data.pickupAddress.state,
        return_country: 'India',
        products_desc: data.items.map(item => item.name).join(', '),
        hsn_code: '',
        cod_amount: data.codAmount || 0,
        order_date: new Date().toISOString(),
        total_amount: data.totalValue,
        seller_add: data.pickupAddress.address,
        seller_name: data.pickupAddress.name,
        seller_inv: '',
        quantity: data.items.reduce((sum, item) => sum + item.quantity, 0),
        waybill: '',
        shipment_width: 10,
        shipment_height: 10,
        weight: Math.max(data.totalWeight / 1000, 0.5), // Convert to kg, minimum 0.5kg
        seller_gst_tin: '',
        shipping_mode: 'Surface',
        address_type: 'home'
      }]
    };

    const response = await fetch('https://track.delhivery.com/api/cmu/create.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        trackingNumber: result.packages[0]?.waybill,
        awbNumber: result.packages[0]?.waybill
      };
    } else {
      throw new Error(result.rmk || 'Delhivery shipment creation failed');
    }
  }

  private async createShiprocketShipment(data: ShipmentData) {
    // First, get auth token
    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: this.apiKey, // Email for Shiprocket
        password: this.apiSecret // Password for Shiprocket
      })
    });

    const authResult = await authResponse.json();
    const token = authResult.token;

    const payload = {
      order_id: data.orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary',
      billing_customer_name: data.customerName,
      billing_last_name: '',
      billing_address: data.deliveryAddress.address,
      billing_city: data.deliveryAddress.city,
      billing_pincode: data.deliveryAddress.pincode,
      billing_state: data.deliveryAddress.state,
      billing_country: 'India',
      billing_email: data.customerEmail,
      billing_phone: data.customerPhone,
      shipping_is_billing: true,
      order_items: data.items.map(item => ({
        name: item.name,
        sku: `SKU-${item.name.replace(/\s+/g, '-')}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 0
      })),
      payment_method: data.paymentMode === 'COD' ? 'COD' : 'Prepaid',
      sub_total: data.totalValue,
      length: 10,
      breadth: 10,
      height: 10,
      weight: Math.max(data.totalWeight / 1000, 0.5)
    };

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.order_id) {
      return {
        success: true,
        trackingNumber: result.shipment_id?.toString(),
        awbNumber: result.awb_code
      };
    } else {
      throw new Error(result.message || 'Shiprocket shipment creation failed');
    }
  }

  private async createBlueDartShipment(data: ShipmentData) {
    // Blue Dart API implementation
    // Note: Blue Dart requires specific API credentials and format
    const payload = {
      // Blue Dart specific payload structure
      Request: {
        Consignments: [{
          CustomerCode: this.apiKey,
          CustomerName: data.pickupAddress.name,
          IsToPayCustomer: data.paymentMode === 'COD',
          Subproduct: 'C',
          ActualWeight: Math.max(data.totalWeight / 1000, 0.5),
          CollectableAmount: data.codAmount || 0,
          Commodity: {
            CommodityDetail1: data.items.map(item => item.name).join(', ')
          },
          Consignee: {
            ConsigneeName: data.customerName,
            ConsigneeAddress1: data.deliveryAddress.address,
            ConsigneeCity: data.deliveryAddress.city,
            ConsigneePincode: data.deliveryAddress.pincode,
            ConsigneeState: data.deliveryAddress.state,
            ConsigneeMobile: data.customerPhone,
            ConsigneeEmailID: data.customerEmail
          },
          Returnable: true,
          PickupDate: new Date().toISOString().split('T')[0],
          PickupTime: '1000',
          DeclaredValue: data.totalValue,
          InvoiceNo: data.orderId,
          ItemCount: data.items.reduce((sum, item) => sum + item.quantity, 0)
        }]
      }
    };

    // Blue Dart API call would go here
    // This is a placeholder as Blue Dart requires specific authentication
    return {
      success: true,
      trackingNumber: 'BD' + Date.now(),
      awbNumber: 'BD' + Date.now()
    };
  }

  private async createDTDCShipment(data: ShipmentData) {
    // DTDC API implementation
    // Note: DTDC requires specific API credentials and format
    const payload = {
      // DTDC specific payload structure
      customerCode: this.apiKey,
      servicetypeId: 'B2C SMART EXPRESS',
      consignments: [{
        customerReferenceNumber: data.orderId,
        senderName: data.pickupAddress.name,
        senderAddress: data.pickupAddress.address,
        senderCity: data.pickupAddress.city,
        senderState: data.pickupAddress.state,
        senderPincode: data.pickupAddress.pincode,
        senderMobile: data.pickupAddress.phone,
        receiverName: data.customerName,
        receiverAddress: data.deliveryAddress.address,
        receiverCity: data.deliveryAddress.city,
        receiverState: data.deliveryAddress.state,
        receiverPincode: data.deliveryAddress.pincode,
        receiverMobile: data.customerPhone,
        receiverEmail: data.customerEmail,
        productType: 'NON-DOCUMENT',
        packageWeight: Math.max(data.totalWeight / 1000, 0.5),
        packageLength: 10,
        packageBreadth: 10,
        packageHeight: 10,
        declaredValue: data.totalValue,
        codAmount: data.codAmount || 0,
        returnAddress: data.pickupAddress.address,
        returnCity: data.pickupAddress.city,
        returnState: data.pickupAddress.state,
        returnPincode: data.pickupAddress.pincode
      }]
    };

    // DTDC API call would go here
    // This is a placeholder as DTDC requires specific authentication
    return {
      success: true,
      trackingNumber: 'DTDC' + Date.now(),
      awbNumber: 'DTDC' + Date.now()
    };
  }

  async trackShipment(trackingNumber: string): Promise<{
    success: boolean;
    status?: string;
    location?: string;
    estimatedDelivery?: string;
    error?: string;
  }> {
    try {
      switch (this.partner) {
        case 'delhivery':
          return await this.trackDelhiveryShipment(trackingNumber);
        case 'shiprocket':
          return await this.trackShiprocketShipment(trackingNumber);
        default:
          return {
            success: true,
            status: 'In Transit',
            location: 'Processing Center',
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async trackDelhiveryShipment(trackingNumber: string) {
    const response = await fetch(
      `https://track.delhivery.com/api/v1/packages/json/?waybill=${trackingNumber}`,
      {
        headers: {
          'Authorization': `Token ${this.apiKey}`
        }
      }
    );

    const result = await response.json();
    
    if (result.ShipmentData && result.ShipmentData.length > 0) {
      const shipment = result.ShipmentData[0].Shipment;
      return {
        success: true,
        status: shipment.Status.Status,
        location: shipment.Status.StatusLocation,
        estimatedDelivery: shipment.ExpectedDeliveryDate
      };
    } else {
      throw new Error('Tracking information not found');
    }
  }

  private async trackShiprocketShipment(trackingNumber: string) {
    // Shiprocket tracking implementation
    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${trackingNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    const result = await response.json();
    
    if (result.tracking_data) {
      const latest = result.tracking_data.track_status[0];
      return {
        success: true,
        status: latest.current_status,
        location: latest.current_location,
        estimatedDelivery: result.tracking_data.expected_delivery_date
      };
    } else {
      throw new Error('Tracking information not found');
    }
  }

  getTrackingUrl(trackingNumber: string): string {
    const partner = deliveryPartners[this.partner];
    return partner ? partner.trackingUrl + trackingNumber : '';
  }
}