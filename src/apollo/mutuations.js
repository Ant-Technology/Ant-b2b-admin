import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation ($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
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
  ) {
    createWarehouse(
      input: {
        name: $name
        _geo: $_geo
        region: { connect: $regionId }
        specific_area: $specific_area
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
  ) {
    updateWarehouse(
      id: $id
      name: $name
      _geo: $_geo
      specific_area: $specific_area
      region: $region
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
  mutation create_regions(
    $name: TranslatableInput!
    $specific_areas: [String]
  ) {
    createRegion(input: { name: $name, specific_areas: $specific_areas }) {
      id
      name
      name_translations {
        en
        am
      }
    }
  }
`;

export const UPDATE_REGION = gql`
  mutation update_region(
    $id: ID!
    $name: TranslatableInput!
    $specific_areas: [String]
  ) {
    updateRegion(
      id: $id
      input: { name: $name, specific_areas: $specific_areas }
    ) {
      id
      name
      specific_areas
      name_translations {
        en
        am
      }
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
    $attributes: CreateAttributeHasMany
  ) {
    createProduct(
      input: {
        name: $name
        short_description: $short_description
        description: $description
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
