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
}) => {
  // state variables
  const [productSkusDropDownData, setProductSkusDropDownData] = useState([]);
  const [warehousesDropDownData, setWarehousesDropDownData] = useState([]);

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
    },
  });

  // mutation
  const [addStock, { loading: stockLoading }] = useMutation(CREATE_STOCK, {
    update(cache, { data: { createStock } }) {
      cache.updateQuery(
        {
          query: GET_STOCKS,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.stocks.data.length === 10) {
            setTotal(total + 1);
            setActivePage(total + 1);
          } else {
            return {
              stocks: {
                data: [createStock, ...data.stocks.data],
              },
            };
          }
        }
      );
    },
  });

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
      });    },
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
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Stock Created Successfully",
        });

        setOpened(false);
      },
      onError(error) {
        setOpened(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Stock Not Created Successfully",
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
              <Grid.Col span={12}>
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
              <Grid.Col span={12}>
                <Button type="submit" color="blue" variant="outline" fullWidth>
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
