import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  Select,
  LoadingOverlay,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { CREATE_STOCK } from "apollo/mutuations";
import { GET_PRODUCT_SKUS, GET_STOCKS, GET_WARE_HOUSES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";

const StockAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
  fetchData,
  size,
  totalPages,
}) => {
  // state variables
  const [productSkusDropDownData, setProductSkusDropDownData] = useState([]);
  const [warehousesDropDownData, setWarehousesDropDownData] = useState([]);
  console.log(totalPages);
  // form state
  const form = useForm({
    initialValues: {
      quantity: null,
      product_sku: {
        connect: "",
      },
      warehouse: {
        connect: "",
      },
      minimum_stock_level: 0,
    },
  });

  // mutation
  const [addStock, { loading: stockLoading }] = useMutation(CREATE_STOCK);

  // graphql queries

  const { loading: productSkusLoading } = useQuery(GET_PRODUCT_SKUS, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      let productSkus = data.productSkus;
      let productSkusArray = [];

      // loop over productSkus data to structure the data for the use of drop down
      productSkus.data.forEach((productSku, index) => {
        productSkusArray.push({
          label: productSku?.sku,
          value: productSku?.id,
        });
      });

      // put it on the state
      setProductSkusDropDownData([...productSkusArray]);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });

  const { loading: warehouseLoading } = useQuery(GET_WARE_HOUSES, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      let warehouses = data.warehouses;
      let warehousesArray = [];

      // loop over productSkus data to structure the data for the use of drop down
      warehouses.data.forEach((warehouse, index) => {
        warehousesArray.push({
          label: warehouse?.name,
          value: warehouse?.id,
        });
      });

      // put it on the state
      setWarehousesDropDownData([...warehousesArray]);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });

  useEffect(() => {}, []);

  const { height } = useViewportSize();

  const submit = () => {
    addStock({
      variables: {
        quantity: parseInt(form.values.quantity),
        product_sku: parseInt(form.values.product_sku.connect),
        warehouse: parseInt(form.values.warehouse.connect),
        minimum_stock_level: parseInt(form.values.minimum_stock_level),
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Stock Created Successfully",
        });
        fetchData(size);
        setOpened(false);
      },
      onError(error) {
        let errorMessage = "Stock Not Created!";
        if (error?.graphQLErrors && error.graphQLErrors.length) {
          const validationErrors = error.graphQLErrors[0]?.extensions?.errors;

          if (validationErrors) {
            errorMessage =
              Object.values(validationErrors).flat().join(", ") || errorMessage;
          }
        }
        showNotification({
          color: "red",
          title: "Error",
          message: errorMessage,
        });
      },
    });
    // e.preventDefault();
  };

  // set the selected value to the form state
  const setPrductSkuDropDownValue = (val) => {
    form.setFieldValue("product_sku.connect", val);
  };

  const setWarehouseDropDownValue = (val) => {
    form.setFieldValue("warehouse.connect", val);
  };

  return (
    <>
      <LoadingOverlay
        visible={productSkusLoading || stockLoading || warehouseLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  required
                  type="number"
                  label="Quantity"
                  placeholder="Quantity"
                  {...form.getInputProps("quantity")}
                />
                <Select
                  data={productSkusDropDownData}
                  value={form
                    .getInputProps("product_sku.connect")
                    ?.value.toString()}
                  onChange={setPrductSkuDropDownValue}
                  label="Product SKU"
                  placeholder="Pick a product sku"
                  searchable
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  type="number"
                  label="Minimum Stock Level"
                  placeholder="Minimum Stock Level"
                  {...form.getInputProps("minimum_stock_level")}
                  styles={{
                    input: {
                      border: "1px solid red", // Set the border color to red
                      backgroundColor: "rgba(255, 0, 0, 0.1)", // Light red background for warning
                    },
                  }}
                />
                <Select
                  data={warehousesDropDownData}
                  value={form
                    .getInputProps("warehouse.connect")
                    ?.value.toString()}
                  onChange={setWarehouseDropDownValue}
                  label="Warehouse"
                  placeholder="Pick a warehouse"
                  searchable
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Button
                  style={{
                    width: "25%",
                    marginTop: "15px",
                    backgroundColor: "#FF6A00",
                    color: "#FFFFFF",
                  }}
                  type="submit"
                  fullWidth
                >
                  Submit
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </form>
      </ScrollArea>
    </>
  );
};

export default StockAddModal;
