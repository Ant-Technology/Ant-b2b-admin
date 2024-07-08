import { gql } from "@apollo/client";
//auth
export const AUTH = gql`
  query {
    auth {
      name
      role
      roles {
        name
      }
    }
  }
`;
//category queries

export const GET_CATEGORIES = gql`
  query GET_CATEGORIES($first: Int!, $page: Int) {
    categories(
      first: $first
      page: $page
      parentOnly: true
      orderBy: { column: NAME, order: DESC }
    ) {
      data {
        id
        name
        productCount
        productSkusCount
        name_translations {
          en
          am
        }
        isParent
        imageUrl
        image {
          id
          original_url
        }
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;
//TODO: remove pagination to get all data
export const GET_CATEGORIES_ALL = gql`
  query GET_CATEGORIES($first: Int!, $page: Int) {
    categories(first: $first, page: $page) {
      data {
        id
        name
        name_translations {
          en
          am
        }
        isParent
        image
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

export const GET_CATEGORY = gql`
  query ($id: ID!) {
    category(id: $id) {
      id
      name
      name_translations {
        en
        am
      }
      imageUrl
      image {
        id
        original_url
      }
      children_count
      children {
        id
        name_translations {
          en
          am
        }
        products {
          id
          name
          description
          imageUrl
          images {
            id
            original_url
          }
        }
      }
    }
  }
`;

// warehouse queries
export const GET_WARE_HOUSES = gql`
  query GET_WARE_HOUSES($first: Int!, $page: Int!) {
    warehouses(first: $first, page: $page) {
      data {
        id
        name
        specific_area
        region {
          id
          name
        }
        stocks {
          id
          quantity
        }
        _geo {
          lat
          lng
        }
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastPage
      }
    }
  }
`;

export const GET_WARE_HOUSE = gql`
  query GET_WARE_HOUSE($id: ID!) {
    warehouse(id: $id) {
      id
      name
      specific_area
      region {
        id
        name
      }
      _geo {
        lat
        lng
      }
    }
  }
`;

// distributor queries

export const GET_DISTRIBUTOR = gql`
  query ($id: ID) {
    distributor(id: $id) {
      id
      name
      contact_email
      contact_name
      contact_phone
      city
      address
      _geo {
        lat
        lng
      }
    }
  }
`;
export const GET_DISTRIBUTORS = gql`
  query ($first: Int!, $page: Int) {
    distributors(first: $first, page: $page) {
      data {
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
      paginatorInfo {
        count
        currentPage
        firstItem
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

//regions

export const GET_REGIONS = gql`
  query ($first: Int!, $page: Int) {
    regions(first: $first, page: $page) {
      data {
        id
        name
        specific_areas
        retailersCount
        driversCount
        warehousesCount
        distributorsCount
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

export const GET_REGION = gql`
  query get_region($id: ID) {
    region(id: $id) {
      id
      name
      name_translations {
        en
        am
      }
      _geo {
        lat
        lng
      }
    }
  }
`;

//products query

export const GET_PRODUCTS = gql`
  query GET_PRODUCTS($first: Int!, $page: Int) {
    products(first: $first, page: $page) {
      data {
        id
        name
        description
        category {
          id
          name
        }
        productSkusCount
        short_description
        images {
          id
          original_url
        }
        attributes {
          id
          name
        }
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

export const NON_PAGINATED_CATEGORIES = gql`
  query {
    categoryNonPaginated {
      id
      name_translations {
        am
        en
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query ($id: ID!) {
    product(id: $id) {
      id
      name
      description
      short_description
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
      category {
        id
        name
      }
      imageUrl
      images {
        id
        original_url
      }
      attributes {
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
        id
      }
      skus {
        id
        sku
        price
        stockCount
        is_active
      }
      allVariants {
        id
        attribute {
          id
          name
        }
        attributeValue {
          id
          value
        }
        # productSkuPrice
      }
      productSkusCount
      orderCount
    }
  }
`;

// productsku queries
export const GET_PRODUCT_SKU = gql`
  query ($id: ID!) {
    productSku(id: $id) {
      id
      sku
      price
      is_active
    }
  }
`;

export const GET_PRODUCT_SKUS = gql`
  query ($first: Int!, $page: Int) {
    productSkus(first: $first, page: $page) {
      data {
        id
        sku
        price
        is_active
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;
// Analytics query
export const GET_ANALYTICS = gql`
  query GetAnalytics {
    getAnalytics {
      orders
      ordersChange
      shipments
      shipmentsChange
      totalSales
      totalSalesChange
      totalActiveProducts
      totalActiveProductsChange
    }
  }
`;
//retailer
export const GET_RETAILER = gql`
  query ($id: ID) {
    retailer(id: $id) {
      id
      name
      contact_email
      contact_name
      contact_phone
      region {
        id
        name
      }
      _geo {
        lat
        lng
      }
      address
      city
      orders {
        id
        state
      }
    }
  }
`;

export const GET_RETAILERS = gql`
  query ($first: Int!, $page: Int) {
    retailers(first: $first, page: $page) {
      data {
        id
        name
        contact_email
        _geo {
          lat
          lng
        }
        city
        region {
          id
          name
        }
        orderCount
        contact_phone
        contact_name
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

// stock
export const GET_STOCKS = gql`
  query ($first: Int!, $page: Int) {
    stocks(first: $first, page: $page) {
      data {
        id
        quantity
        product_sku {
          sku
        }
        warehouse {
          name
        }
        transactions {
          before_quantity
          after_quantity
          transactionable {
            __typename
            ... on StockManagementAction {
              id
              type
            }
          }
        }
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

//orders
export const GET_ORDER = gql`
  query ($id: ID!) {
    order(id: $id) {
      id
      total_price
      items {
        id
        quantity
        state
        product_sku {
          id
          price
          sku
          is_active
        }
      }
      shipment_items {
        id
        shipment {
          id
          departure_time
          arrival_time
          status
          from {
            __typename
            ... on Warehouse {
              name
            }
          }
          to {
            __typename
            ... on Distributor {
              id
              name
            }
          }
        }
      }
      retailer {
        id
        name
        contact_phone
      }
      driver {
        id
        name
      }
    }
  }
`;

export const GET_ORDERS = gql`
  query ($first: Int!, $page: Int) {
    orders(first: $first, page: $page) {
      data {
        id
        total_price
        created_at_human
        created_at
        retailer {
          id
          name
        }
        state
        productSkuCount
        driver {
          id
          name
        }
        items {
          id
          quantity
          state
          product_sku {
            id
            sku
            price
          }
        }
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

//  shipment
export const GET_SHIPMENT = gql`
  query ($id: ID!) {
    shipment(id: $id) {
      id
      arrival_time
      cost
      items {
        shipment_itemable {
          ... on OrderItem {
            order {
              id
              items {
                id
                product_sku {
                  id
                  sku
                  product {
                    name
                  }
                }
              }
            }
          }
        }
      }
      departure_time
      from {
        __typename
        ... on Warehouse {
          id
          name
        }
        ... on Distributor {
          id
          name
        }
      }
      to {
        __typename
        ... on Retailer {
          id
          name
        }
        ... on Distributor {
          id
          name
        }
        ... on Warehouse {
          id
          name
        }
      }
    }
  }
`;

export const GET_SHIPMENTS = gql`
  query ($first: Int!, $page: Int) {
    shipments(first: $first, page: $page) {
      data {
        id
        departure_time
        self_shipment
        arrival_time
        items {
          shipment_itemable {
            ... on OrderItem {
              order {
                id
                items {
                  id
                  product_sku {
                    id
                    sku
                    product {
                      name
                      images {
                        id
                        original_url
                    }
                  }
                  }
                }
              }
            }
          }
        }
        cost
        status
        from {
          __typename
          ... on Warehouse {
            id
            name
          }
          ... on Distributor {
            id
            name
          }
        }
        to {
          __typename
          ... on Retailer {
            id
            name
          }
          ... on Distributor {
            id
            name
          }
          ... on Warehouse {
            id
            name
          }
        }
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

// Dashboard queries
export const GET_ALL_GEO_LOCATIONS = gql`
  query {
    retailersNonPaginated {
      id
      name
      address
      region
      {
          id
          name
      }
      _geo {
        lat
        lng
      }
    }

    distributorsNonPaginated {
      id
      name
      address
      region
      {
          id
          name
      }
      _geo {
        lat
        lng
      }
    }

    warehousesNonPaginated {
      id
      name
      region
      {
          id
          name
      }
      _geo {
        lat
        lng
      }
    }
  }
`;

// wallet queries
export const DEPOSIT_SLIPS = gql`
  query ($first: Int!, $page: Int) {
    depositSlips(first: $first, page: $page) {
      data {
        id
        reference_number
        confirmed_at_human
        amount
        retailer {
          id
          name
        }
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

export const DEPOSIT_SLIP = gql`
  query ($id: ID!) {
    depositSlip(id: $id) {
      amount
      slip
      confirmed_at_human
      reference_number
      retailer {
        name
      }
    }
  }
`;

//vehicle types
export const GET_VEHICLE_TYPES = gql`
  query ($first: Int!, $page: Int) {
    vehicleTypes(first: $first, page: $page) {
      data {
        id
        title
        image
        type
        starting_price
        price_per_kilometer
        vehicleCount
        created_at
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

export const GET_VEHICLE_TYPE = gql`
  query ($id: ID!) {
    vehicleType(id: $id) {
      id
      title
      type
      starting_price
      price_per_kilometer
      title_translations {
        am
        en
      }
    }
  }
`;

//drivers
export const GET_DRIVERS = gql`
  query ($first: Int!, $page: Int) {
    drivers(first: $first, page: $page) {
      data {
        id
        name
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

export const GET_DRIVER = gql`
  query ($id: ID!) {
    driver(id: $id) {
      id
      name
      city
      phone
      email
      address
    }
  }
`;

//vehicles
export const GET_VEHICLES = gql`
  query ($first: Int!, $page: Int) {
    vehicles(first: $first, page: $page) {
      data {
        id
        name
        owner_name
        color
        plate_number
        owner_phone
        vehicle_type {
          id
          title
        }
        driver {
          id
          name
        }
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

export const GET_VEHICLE = gql`
  query ($id: ID!) {
    vehicle(id: $id) {
      id
      name
      model
      owner_name
      color
      plate_number
      owner_phone
      vehicle_type {
        id
        title
      }
      driver {
        id
        name
      }
    }
  }
`;

//dropoffs

export const GET_DROPOFFS = gql`
  query ($first: Int!, $page: Int) {
    dropoffs(first: $first, page: $page) {
      data {
        id
        status
        cost
        driver {
          name
        }
        created_at
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

export const GET_DROPOFF = gql`
  query ($id: ID!) {
    dropoff(id: $id) {
      id
      status
      from {
        ... on Distributor {
          id
          name
        }
      }
      driver {
        id
        name
        city
        phone
        address
      }
      dropoff_order {
        id
        received
        order {
          id
          total_price
          retailer {
            name
            contact_phone
            address
            city
          }
          items {
            id
            quantity

            product_sku {
              id
              sku
              product {
                name
                images {
                  original_url
                }
              }
            }
          }
        }
      }
    }
  }
`;

//general users query

export const GET_ALL_USERS = gql`
  query ($first: Int!, $page: Int) {
    users(first: $first, page: $page) {
      data {
        id
        name
        email
        profile_image
        roles {
          id
          name
        }
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

// roles query

export const GET_ROLES = gql`
  query {
    roles {
      id
      name
    }
  }
`;
