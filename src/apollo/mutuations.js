import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation ($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      roles
      permissions {
        name
      }
    }
  }
`;

//caregory mutations
export const CREATE_CATEGORY = gql`
  mutation (
    $name: TranslatableInput!
    $image: Upload
    $children: [CreateCategoryChilderenInput!]!
  ) {
    createCategory(
      input: { name: $name, image: $image, children: { create: $children } }
    ) {
      id
      name
    }
  }
`;

export const DEL_CATEGORY = gql`
  mutation DEL_CATEGORY($id: ID!) {
    deleteCategory(id: $id) {
      id
    }
  }
`;
export const DEL_Product_CATEGORY = gql`
  mutation DEL_PRODUCT_CATEGORY($id: ID!) {
    deleteSupplierProductCategory(id: $id) {
      id
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UPDATE_CATEGORY(
    $id: ID!
    $image: Upload
    $name: TranslatableInput!
    $children: UpdateCategoryHasMany
  ) {
    updateCategory(
      id: $id
      input: { name: $name, image: $image, children: $children }
    ) {
      id
      name
      children_count
      name_translations {
        en
        am
      }
      children {
        id
        name_translations {
          en
          am
        }
      }
    }
  }
`;

// ware houses
export const CREATE_WARE_HOUSE = gql`
  mutation CREATE_WARE_HOUSE(
    $name: String!
    $_geo: GeoInput
    $regionId: ID!
    $specific_area: String
    $supplier_id: String!
  ) {
    createWarehouse(
      input: {
        name: $name
        _geo: $_geo
        region: { connect: $regionId }
        specific_area: $specific_area
        supplier_id: $supplier_id
      }
    ) {
      id
      specific_area
    }
  }
`;
export const UPDATE_WARE_HOUSE = gql`
  mutation UPDATE_WARE_HOUSE(
    $id: ID!
    $name: String!
    $_geo: GeoInput!
    $specific_area: String!
    $region: UpdateRegionBelongsTo!
    $supplier_id: String!
  ) {
    updateWarehouse(
      id: $id
      name: $name
      _geo: $_geo
      specific_area: $specific_area
      region: $region
      supplier_id: $supplier_id
    ) {
      id
      name
      _geo {
        lat
        lng
      }
      specific_area
      region {
        id
        name
      }
    }
  }
`;

export const DEL_WAREHOUSE = gql`
  mutation DEL_WAREHOUSE($id: ID!) {
    deleteWarehouse(id: $id) {
      id
      name
      _geo {
        lat
        lng
      }
    }
  }
`;

// distributor mutations
export const CREATE_DISTRIBUTOR = gql`
  mutation CREATE_DISTRIBUTOR(
    $name: String!
    $address: String!
    $_geo: GeoInput
    $city: String
    $contact_name: String!
    $contact_phone: String!
    $contact_email: String
    $region: CreateRegionBelongsTo!
    $user: CreateUserBelongsTo!
  ) {
    createDistributor(
      input: {
        name: $name
        address: $address
        _geo: $_geo
        city: $city
        contact_name: $contact_name
        contact_phone: $contact_phone
        contact_email: $contact_email
        region: $region
        user: $user
      }
    ) {
      id
      name
    }
  }
`;
export const UPDATE_DISTRIBUTOR = gql`
  mutation UPDATE_DISTRIBUTOR(
    $id: ID!
    $name: String!
    $address: String!
    $_geo: GeoInput
    $city: String
    $contact_name: String!
    $contact_phone: String!
  ) {
    updateDistributor(
      id: $id
      input: {
        name: $name
        address: $address
        _geo: $_geo
        city: $city
        contact_name: $contact_name
        contact_phone: $contact_phone
      }
    ) {
      id
      name
      contact_phone
      _geo {
        lat
        lng
      }
      city
      contact_name
    }
  }
`;
export const DEL_DISTRIBUTOR = gql`
  mutation DEL_DISTRIBUTOR($id: ID!) {
    deleteDistributor(id: $id) {
      id
      name
    }
  }
`;

// region related mutation retailer
export const CREATE_REGIONS = gql`
  mutation create_regions($name: String!) {
    createRegion(input: { name: $name }) {
      id
      name
    }
  }
`;

export const UPDATE_REGION = gql`
  mutation update_region($id: ID!, $name: String!) {
    updateRegion(id: $id, input: { name: $name }) {
      id
      name
    }
  }
`;

export const DEL_REGION = gql`
  mutation ($id: ID!) {
    deleteRegion(id: $id) {
      id
      name
    }
  }
`;

//products mutation
export const CREATE_PRODUCT = gql`
  mutation CREATE_PRODUCT(
    $name: TranslatableInput!
    $short_description: TranslatableInput!
    $description: TranslatableInput!
    $is_active: Boolean
    $images: [Upload]
    $category: CreateCategoryHasOne!
    $supplier_business_id: String
    $attributes: CreateAttributeHasMany
  ) {
    createProduct(
      input: {
        name: $name
        short_description: $short_description
        description: $description
        supplier_business_id: $supplier_business_id
        is_active: $is_active
        images: $images
        category: $category
        attributes: $attributes
      }
    ) {
      id
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UPDATE_PRODUCT(
    $id: ID!
    $name: TranslatableInput!
    $short_description: TranslatableInput!
    $description: TranslatableInput!
    $supplier_id: String
    $images: UpdateProductImagesInput
    $category: CreateCategoryHasOne!
    $is_active: Boolean
    $attributes: UpdateAttributeHasMany
  ) {
    updateProduct(
      id: $id
      input: {
        name: $name
        short_description: $short_description
        description: $description
        is_active: $is_active
        images: $images
        category: $category
        supplier_id: $supplier_id
        attributes: $attributes
      }
    ) {
      id
      name
      name_translations {
        en
        am
      }
      short_description_translations {
        en
        am
      }
      description_translations {
        en
        am
      }
      is_active
      attributes {
        id
        name
        name_translations {
          am
          en
        }
        values {
          id
          value
          value_translations {
            en
            am
          }
        }
      }
      category {
        id
      }

      images {
        id
        original_url
      }
    }
  }
`;

export const DEL_PRODUCT = gql`
  mutation DEL_PRODUCT($id: ID!) {
    deleteProduct(id: $id) {
      id
      name
    }
  }
`;

//product skus

export const CREATE_PRODUCT_SKUS = gql`
  mutation (
    $price: Float!
    $is_active: Boolean!
    $buy_price: Float!
    $product: ID!
    $variants: [CreateProductVariantInput!]!
  ) {
    createProductSku(
      input: {
        price: $price
        buy_price: $buy_price
        is_active: $is_active
        product: { connect: $product }
        variants: { create: $variants }
      }
    ) {
      id
      sku
    }
  }
`;
export const UPDATE_PRODUCT_SKUS = gql`
  mutation UPDATE_PRODUCT_SKUS(
    $id: ID!
    $sku: String!
    $price: Float!
    $buy_price: Float!
    $is_active: Boolean
  ) {
    updateProductSku(
      id: $id
      input: {
        sku: $sku
        price: $price
        is_active: $is_active
        buy_price: $buy_price
      }
    ) {
      id
      sku
      buy_price
      price
      is_active
      product {
        name
      }
    }
  }
`;

export const DEL_PRODUCT_SKU = gql`
  mutation DEL_PRODUCT_SKU($id: ID!) {
    deleteProductSku(id: $id) {
      id
    }
  }
`;
//retailer
export const CREATE_RETAILER = gql`
  mutation create_retailer(
    $name: String!
    $address: String!
    $_geo: GeoInput
    $city: String
    $contact_name: String!
    $contact_phone: String!
    $contact_email: String
    $region: CreateRegionBelongsTo!
    $user: CreateUserBelongsTo!
    $registered_by: ID
  ) {
    createRetailer(
      input: {
        name: $name
        address: $address
        _geo: $_geo
        city: $city
        contact_name: $contact_name
        contact_phone: $contact_phone
        contact_email: $contact_email
        region: $region
        user: $user
        registered_by: $registered_by
      }
    ) {
      id
      name
    }
  }
`;
export const CREATE_WAREHOUSE_MANAGER = gql`
  mutation createWarehouseManager(
    $name: String!
    $phone: String!
    $email: String!
    $password: String!
    $password_confirmation: String!
    $warehouse_id: String!
  ) {
    createWarehouseManager(
      input: {
        name: $name
        phone: $phone
        email: $email
        password: $password
        password_confirmation: $password_confirmation
        warehouse_id: $warehouse_id
      }
    ) {
      id
      warehouse {
        name
      }
      user {
        name
        phone
        email
      }
    }
  }
`;
export const CREATE_SUPPLIER = gql`
  mutation createSupplier(
    $name: String!
    $address: String!
    $city: String!
    $phone: String!
    $email: String!
    $password: String!
    $password_confirmation: String!
  ) {
    createSupplier(
      input: {
        name: $name
        address: $address
        city: $city
        phone: $phone
        email: $email
        password: $password
        password_confirmation: $password_confirmation
      }
    ) {
      id
      city
      address
      user {
        name
        phone
        email
      }
    }
  }
`;
export const CREATE_SUPPLIER_Business = gql`
  mutation createSupplierBusiness(
    $business_name: String!
    $business_email: String
    $business_phone_number: String!
    $business_website: String
    $business_type: String!
    $business_region_id: String!
    $business_zone: String!
    $business_woreda: String!
    $business_kebele: String!
    $business_geo_location: GeoInput!
    $owner_firstname: String!
    $owner_middlename: String!
    $owner_lastname: String!
    $owner_phone_number: String!
    $owner_id_type: String!
    $tin: String!
    $number_of_warehouses: Int!
    $business_registration_number: String!
    $trade_license_document: Upload!
    $tin_certification_document: Upload!
    $owner_id: Upload!
  ) {
    createSupplierBusiness(
      input: {
        business_name: $business_name
        business_email: $business_email
        business_phone_number: $business_phone_number
        business_website: $business_website
        business_type: $business_type
        business_region_id: $business_region_id
        business_zone: $business_zone
        business_woreda: $business_woreda
        business_kebele: $business_kebele
        business_geo_location: $business_geo_location
        owner_firstname: $owner_firstname
        owner_middlename: $owner_middlename
        owner_phone_number: $owner_phone_number
        owner_id_type: $owner_id_type
        tin: $tin
        owner_lastname: $owner_lastname
        number_of_warehouses: $number_of_warehouses
        business_registration_number: $business_registration_number
        trade_license_document: $trade_license_document
        tin_certification_document: $tin_certification_document
        owner_id: $owner_id
      }
    ) {
      id
    }
  }
`;
export const CREATE_SUPPLIER_commission = gql`
  mutation createSupplierCommission(
    $supplier_id: String!
    $commission_rate: Float!
  ) {
    createSupplierCommission(
      input: { supplier_id: $supplier_id, commission_rate: $commission_rate }
    ) {
      id
      commission_rate
      supplier {
        city
        address
        user {
          name
          phone
        }
      }
    }
  }
`;
export const CREATE_PRODUCT_CATEGORIES = gql`
  mutation createSupplierProductCategory(
    $supplier_business_id: String!
    $category_ids: [String!]
  ) {
    createSupplierProductCategory(
      input: {
        supplier_business_id: $supplier_business_id
        category_ids: $category_ids
      }
    ) {
      category {
        name
      }
      supplier {
        business_name
        business_type
        business_phone_number
      }
    }
  }
`;
export const CREATE_Shipping = gql`
  mutation createWarehouseShippingEstimation(
    $warehouse_id: String!
    $category_id: String!
    $days: Int
    $hours: Int
    $minutes: Int
  ) {
    createWarehouseShippingEstimation(
      input: {
        warehouse_id: $warehouse_id
        category_id: $category_id
        days: $days
        hours: $hours
        minutes: $minutes
      }
    ) {
      id
    }
  }
`;

export const UPDATE_RETAILER = gql`
  mutation update_retailer(
    $id: ID!
    $name: String!
    $address: String!
    $_geo: GeoInput
    $city: String
    $contact_name: String!
    $contact_phone: String!
  ) {
    updateRetailer(
      id: $id
      input: {
        name: $name
        address: $address
        _geo: $_geo
        city: $city
        contact_name: $contact_name
        contact_phone: $contact_phone
      }
    ) {
      id
      name
      _geo {
        lat
        lng
      }
      city
      contact_name
      address
    }
  }
`;
export const UPDATE_SUPPLIER = gql`
  mutation update_retailer(
    $id: ID!
    $name: String!
    $address: String!
    $city: String!
    $phone: String!
    $email: String
  ) {
    updateSupplier(
      id: $id
      input: {
        name: $name
        address: $address
        city: $city
        phone: $phone
        email: $email
      }
    ) {
      id
      user {
        name
        phone
        email
      }
      address
      city
    }
  }
`;
export const UPDATE_Manager = gql`
  mutation update_manager(
    $id: ID!
    $name: String!
    $phone: String!
    $email: String
    $warehouse_id: String!
  ) {
    updateWarehouseManager(
      id: $id
      input: {
        name: $name
        phone: $phone
        email: $email
        warehouse_id: $warehouse_id
      }
    ) {
      id
      warehouse {
        name
      }
      user {
        name
        phone
        email
      }
    }
  }
`;

export const UPDATE_SHIPPING = gql`
  mutation update_shipping(
    $id: ID!
    $category_id: String
    $days: Int
    $hours: Int
    $minutes: Int
  ) {
    updateWarehouseShippingEstimation(
      id: $id
      input: {
        category_id: $category_id
        days: $days
        hours: $hours
        minutes: $minutes
      }
    ) {
      id
      category {
        name
      }
      warehouse {
        name
      }
      days
      hours
      minutes
    }
  }
`;

export const UPDATE_SUPPLIER_Commistion = gql`
  mutation updateSupplierCommission($id: ID!, $commission_rate: Float!) {
    updateSupplierCommission(
      id: $id
      input: { commission_rate: $commission_rate }
    ) {
      id
      commission_rate
      supplier {
        user {
          name
          phone
          email
        }
      }
    }
  }
`;

export const DEL_RETAILER = gql`
  mutation DEL_RETAILER($id: ID!) {
    deleteRetailer(id: $id) {
      id
      name
      _geo {
        lat
        lng
      }
      city
      contact_name
    }
  }
`;
export const DEL_SUPPLIER = gql`
  mutation DEL_SUPPLIER($id: ID!) {
    deleteSupplier(id: $id) {
      id
    }
  }
`;
export const DEL_BUSINESS = gql`
  mutation DEL_BUSINESS($id: ID!) {
    deleteSupplierBusiness(id: $id) {
      id
    }
  }
`;
export const DEL_MANAGER = gql`
  mutation DEL_MANAGER($id: ID!) {
    deleteWarehouseManager(id: $id) {
      id
    }
  }
`;
export const DEL_Shipping = gql`
  mutation DEL_SHIPPING($id: ID!) {
    deleteWarehouseShippingEstimation(id: $id) {
      id
    }
  }
`;
export const DEL_SUPPLIER_Commission = gql`
  mutation DEL_SUPPLIER_Commission($id: ID!) {
    deleteSupplierCommission(id: $id) {
      id
    }
  }
`;

//stock

export const CREATE_STOCK = gql`
  mutation CREATE_STOCK(
    $quantity: Int!
    $minimum_stock_level: Int!
    $product_sku: ID!
    $warehouse: ID!
  ) {
    createStock(
      input: {
        quantity: $quantity
        minimum_stock_level: $minimum_stock_level
        product_sku: { connect: $product_sku }
        warehouse: { connect: $warehouse }
      }
    ) {
      id
    }
  }
`;
export const ACCEPT_SHIPMENT_REQUEST = gql`
  mutation ACCEPT_SHIPMENT_REQUEST($shipment_id: ID!, $driver_id: ID!) {
    acceptShipmentRequest(shipment_id: $shipment_id, driver_id: $driver_id) {
      id
    }
  }
`;
export const MANAGE_STOCK = gql`
  mutation MANAGE_STOCK(
    $stock_id: ID!
    $type: StockManagementActionType!
    $reason: String!
    $quantity: Int!
  ) {
    stockManagementAction(
      input: {
        stock_id: $stock_id
        type: $type
        reason: $reason
        quantity: $quantity
      }
    ) {
      id
      reason
    }
  }
`;
export const DEL_STOCK = gql`
  mutation ($id: ID!) {
    deleteStock(id: $id) {
      id
    }
  }
`;

//shipment
export const CREATE_SHIPMENT = gql`
  mutation CREATE_SHIPMENT(
    $arrival_time: DateTime!
    $departure_time: DateTime!
    $cost: Float!
    $from: CreateShipmentFromMorphTo!
    $to: CreateShipmentToMorphTo!
  ) {
    createShipment(
      input: {
        arrival_time: $arrival_time
        departure_time: $departure_time
        cost: $cost
        from: $from
        to: $to
      }
    ) {
      id
      arrival_time
      departure_time
      status
    }
  }
`;

export const MANAGE_SHIPMENT = gql`
  mutation MANAGE_SHIPMENT(
    $id: ID!
    $arrival_time: DateTime!
    $departure_time: DateTime!
    $cost: Float!
    $status: ShipmentStatusType!
    $from: UpdateShipmentFromMorphTo!
    $to: UpdateShipmentToMorphTo!
  ) {
    updateShipment(
      id: $id
      input: {
        arrival_time: $arrival_time
        departure_time: $departure_time
        cost: $cost
        status: $status
        from: $from
        to: $to
      }
    ) {
      id
    }
  }
`;
export const DEL_SHIPMENT = gql`
  mutation DEL_SHIPMENT($id: ID!) {
    deleteShipment(id: $id) {
      id
    }
  }
`;

export const SHIP_ITEM = gql`
  mutation SHIP_ITEM(
    $shipment: CreateShipmentBelongsTo!
    $shipment_itemable: [CreateShipmentItemableMorphTo]!
  ) {
    createShipmentItems(
      input: { shipment: $shipment, shipment_itemable: $shipment_itemable }
    ) {
      id
      shipment {
        id
        arrival_time
      }
    }
  }
`;

//wallet mutuation
export const CONFIRM_DEPOSIT_SLIP = gql`
  mutation ($deposit_id: ID!) {
    confirmDepositSlip(deposit_id: $deposit_id) {
      id
    }
  }
`;
export const DIS_APPROVE_DEPOSIT_SLIP = gql`
  mutation ($deposit_id: ID!) {
    diapproveDepositWithSlip(deposit_id: $deposit_id) {
      id
    }
  }
`;
export const CREATE_VEHICLE_TYPE = gql`
  mutation (
    $title: TranslatableInput!
    $type: String!
    $starting_price: Float!
    $image: Upload
    $price_per_kilometer: Float!
  ) {
    createVehicleType(
      input: {
        title: $title
        type: $type
        starting_price: $starting_price
        image: $image
        price_per_kilometer: $price_per_kilometer
      }
    ) {
      id
    }
  }
`;

export const DEL_VEHICLE_TYPES = gql`
  mutation ($id: ID!) {
    deleteVehicleType(id: $id) {
      id
      title
    }
  }
`;

export const UPDATE_VEHICLE_TYPE = gql`
  mutation (
    $id: ID!
    $title: TranslatableInput!
    $type: String!
    $starting_price: Float
    $image: Upload
    $price_per_kilometer: Float
  ) {
    updateVehicleType(
      id: $id
      input: {
        title: $title
        type: $type
        image: $image
        starting_price: $starting_price
        price_per_kilometer: $price_per_kilometer
      }
    ) {
      id
      title
      type
      image
    }
  }
`;

export const CREATE_DROP_OFF = gql`
  mutation CREATE_DROP_OFF(
    $vehicleType: CreateVehicleTypeBelongsTo!
    $from: CreateDropoffFromMorphTo!
    $orders: CreateDropoffOrdersInput!
  ) {
    createDropoff(
      input: { vehicle_type: $vehicleType, from: $from, orders: $orders }
    ) {
      id
    }
  }
`;
export const MARK_AS_DELIVERED_SELF_SHIPMENT = gql`
  mutation MARK_AS_DELIVERED_SELF_SHIPMENT($shipment_id: ID!) {
    markAsDeliveredSelfShipment(shipment_id: $shipment_id) {
      id
      status
    }
  }
`;
//drivers
export const CREATE_DRIVER = gql`
  mutation (
    $name: String!
    $address: String!
    $city: String
    $_geo: GeoInput
    $phone: String!
    $email: String!
    $password: String!
    $password_confirmation: String!
    $region: CreateRegionBelongsTo!
  ) {
    createDriver(
      input: {
        name: $name
        address: $address
        city: $city
        _geo: $_geo
        phone: $phone
        email: $email
        region: $region
        password: $password
        password_confirmation: $password_confirmation
      }
    ) {
      id
    }
  }
`;

export const UPDATE_DRIVER = gql`
  mutation (
    $id: ID!
    $name: String!
    $address: String!
    $city: String!
    $phone: String!
  ) {
    updateDriver(
      id: $id
      input: { name: $name, address: $address, city: $city, phone: $phone }
    ) {
      id
      name
    }
  }
`;

export const DEL_DRIVER = gql`
  mutation ($id: ID!) {
    deleteDriver(id: $id) {
      id
      name
    }
  }
`;

//vehicle
export const CREATE_VEHICLE = gql`
  mutation (
    $model: String!
    $plate_number: String!
    $color: String!
    $owner_name: String!
    $owner_phone: String!
    $driver: CreateDriverBelongsTo!
    $region: CreateRegionBelongsTo!
    $vehicle_type: CreateVehicleTypeBelongsTo!
    $plate_doc: Upload
    $license_doc: Upload
    $libre_doc: Upload
  ) {
    createVehicle(
      input: {
        model: $model
        plate_number: $plate_number
        color: $color
        owner_name: $owner_name
        owner_phone: $owner_phone
        driver: $driver
        vehicle_type: $vehicle_type
        region: $region
        plate_doc: $plate_doc
        license_doc: $license_doc
        libre_doc: $libre_doc
      }
    ) {
      id
      color
      owner_name
      owner_phone
      plate_number
      vehicle_type {
        title
      }
      driver {
        name
      }
    }
  }
`;

export const UPDATE_VEHICLE = gql`
  mutation (
    $id: ID!
    $model: String!
    $plate_number: String!
    $color: String!
    $owner_name: String!
    $owner_phone: String!
    $region: CreateRegionBelongsTo!
    $driver: CreateDriverBelongsTo!
    $vehicle_type: CreateVehicleTypeBelongsTo!
  ) {
    updateVehicle(
      id: $id
      input: {
        model: $model
        plate_number: $plate_number
        color: $color
        owner_name: $owner_name
        owner_phone: $owner_phone
        region: $region
        driver: $driver
        vehicle_type: $vehicle_type
      }
    ) {
      id
      color
      owner_name
      owner_phone
      plate_number
      vehicle_type {
        title
      }
      driver {
        name
      }
    }
  }
`;
export const DEL_VEHICLE = gql`
  mutation ($id: ID!) {
    deleteVehicle(id: $id) {
      id
    }
  }
`;
export const LOGOUT = gql`
  mutation {
    logout {
      status
    }
  }
`;

//user mutations

export const DEL_USER = gql`
  mutation ($id: ID!) {
    deleteUser(id: $id) {
      id
      name
      email
    }
  }
`;
export const DEL_PAYMENT_TYPE = gql`
  mutation ($id: ID!) {
    deletePaymentType(id: $id) {
      id
    }
  }
`;
export const CHANGE_USER_STATUS = gql`
  mutation ChangeUserStatus($id: ID!, $status: String!) {
    changeUserStatus(id: $id, status: $status) {
      id
      name
      status
    }
  }
`;
export const Change_Supplier_BusinessStatus = gql`
  mutation ChangeUserStatus($id: ID!, $status: String!) {
    changeSupplierBusinessStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const CHANGE_VEHICLE_TYPE_STATUS = gql`
  mutation ChangeVehicleTypeStatus($id: ID!, $status: String!) {
    changeVehicleTypeStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;
export const CHANGE_WAREHOUSE_STATUS = gql`
  mutation ChangeWarehouseStatus($id: ID!, $status: String!) {
    changeWarehouseStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;
export const RECALL_DRIVER_FOR_PENDING_DROPOFF = gql`
  mutation RecallDriverForPendingDropoff($dropoff_id: ID!) {
    recallDriverForPendingDropoff(dropoff_id: $dropoff_id) {
      id
    }
  }
`;

export const CREATE_USER = gql`
  mutation (
    $name: String!
    $email: String!
    $password: String!
    $phone: String!
    $profile_image: Upload
    $password_confirmation: String!
    $role_id: String!
  ) {
    createUser(
      input: {
        name: $name
        email: $email
        phone: $phone
        password: $password
        password_confirmation: $password_confirmation
        role_id: $role_id
        profile_image: $profile_image
      }
    ) {
      id
      name
    }
  }
`;
export const CREATE_PAYMENT_TYPE = gql`
  mutation ($name: String!, $logo: Upload) {
    createPaymentType(input: { name: $name, logo: $logo }) {
      id
      name
      status
    }
  }
`;

export const UPDATE_PAYMENT_TYPE = gql`
  mutation ($id: ID!, $input: UpdatePaymentTypeInput!) {
    updatePaymentType(id: $id, input: $input) {
      id
      name
      logo
    }
  }
`;
export const UPDATE_MINIMUM_STOCK_LEVEL = gql`
  mutation ($id: ID!, $input: UpdateStockInput!) {
    updateStock(id: $id, input: $input) {
      id
      minimum_stock_level
    }
  }
`;

export const UPDATE_USER = gql`
  mutation (
    $id: ID!
    $name: String!
    $phone: String!
    $password: String!
    $password_confirmation: String!
    $profile_image: Upload
  ) {
    updateUser(
      id: $id
      input: {
        name: $name
        password: $password
        phone: $phone
        password_confirmation: $password_confirmation
        profile_image: $profile_image
      }
    ) {
      id
      name
      phone
      email
      profile_image
    }
  }
`;

//ROles
export const ATTACH_ROLE = gql`
  mutation ($user_id: ID!, $role: String!) {
    attachRole(user_id: $user_id, role: $role) {
      id
      name
      roles {
        id
        name
      }
    }
  }
`;

export const DETTACH_ROLE = gql`
  mutation ($user_id: ID!, $role: String!) {
    detachRole(user_id: $user_id, role: $role) {
      id
      name
      roles {
        id
        name
      }
    }
  }
`;
