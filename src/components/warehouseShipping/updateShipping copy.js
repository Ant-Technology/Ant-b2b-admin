import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  Select,
  LoadingOverlay,
  PasswordInput,
  Col,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import {
  CREATE_Shipping,
  CREATE_SUPPLIER,
  CREATE_WAREHOUSE_MANAGER,
  UPDATE_SHIPPING,
} from "apollo/mutuations";
import {
  NON_PAGINATED_GET_MY_SUPPLIERS_Business,
  GET_MY_WARE_HOUSES,
  GET_SUPPLIERS,
  GET_WARE_HOUSE_MANAGERS,
  GET_WARE_HOUSE_SHIPPING,
} from "apollo/queries";
import { customLoader } from "components/utilities/loader";

const ShippingUpdateModal = ({ setOpenedEdit, row }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tempBusiness, setTempBusiness] = useState([]);
  const form = useForm({
    initialValues: {
      warehouse_id: "",
      category_id: "",
      category: "",
      days: 0,
      hours: 0,
      minutes: 0,
    },
  });
  const { loading: supplierLoading } = useQuery(GET_MY_WARE_HOUSES, {
    variables: {
      first: parseInt(1000),
      page: 1,
    },

    onCompleted(data) {
      const arr = data.myWarehouses.data.map((item) => ({
        label: item.name,
        value: item.id,
      }));

      setWarehouses(arr);
    },
  });
  const [business, setBusiness] = useState([]);

  const { loading: businessLoading, refetch } = useQuery(
    NON_PAGINATED_GET_MY_SUPPLIERS_Business,
    {
      variables: {
        first: parseInt(1000),
        page: 1,
        search: "",
        ordered_by: [
          {
            column: "CREATED_AT",
            order: "DESC",
          },
        ],
      },

      onCompleted(data) {
        const arr = data.myBusinesses.data.map((item) => ({
          label: item.business_name,
          value: item.id,
        }));

        setBusiness(arr);
        setTempBusiness(data.myBusinesses.data);
      },
    }
  );
  const [updateShipping, { loading: warehouseManagerLoading }] =
    useMutation(UPDATE_SHIPPING);

  const { height } = useViewportSize();
  const submit = () => {
    if (form.validate().hasErrors) {
      return;
    }
    updateShipping({
      variables: {
        id: row.id,
        category_id: form.getInputProps("category_id").value,
        minutes: parseInt(form.getInputProps("minutes").value),
        days: parseInt(form.getInputProps("days").value),
        hours: parseInt(form.getInputProps("hours").value),
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Shipping Estimation updated Successfully",
        });
        setOpenedEdit(false);
      },
      onError(error) {
        let errorMessage = "Shipping Estimation Not updated Successfully!";
        if (error?.length) {
          const graphQLError = error.graphQLErrors[0];
          const debugMessage = graphQLError?.debugMessage || "";
          const validationErrors = graphQLError?.extensions?.validation;

          if (validationErrors) {
            errorMessage = Object.values(validationErrors).flat().join(", ");
          } else {
            errorMessage = debugMessage || errorMessage;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        showNotification({
          color: "red",
          title: "Error",
          message: errorMessage,
        });
      },
    });
  };
  const handleCategoryChange = (val) => {
    form.setFieldValue("category", val);
    const selectedCategory = categories.find((cat) => cat.category.id === val);
    setSubcategories(
      selectedCategory ? selectedCategory.category.children : []
    );
    form.setFieldValue("category_id", ""); // Reset subcategory
  };
  const setWarehouseDropDownValue = (val) => {
    form.setFieldValue("warehouse_id", val);
  };

  const handleSupplierChange = (val) => {
    const selectedBusiness = tempBusiness.find((cat) => cat.id === val);
    setCategories(selectedBusiness ? selectedBusiness.categories : []);
  };
  return (
    <>
      <LoadingOverlay
        visible={warehouseManagerLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  data={warehouses}
                  value={form
                    .getInputProps("warehouse.connect")
                    ?.value?.toString()}
                  onChange={setWarehouseDropDownValue}
                  label="Warehouse"
                  placeholder="Pick a warehouse"
                  searchable
                />

                <Select
                  searchable
                  data={categories.map((sub) => ({
                    label: sub.category.name,
                    value: sub.category.id,
                  }))}
                  value={form.getInputProps("category").value?.toString()}
                  onChange={handleCategoryChange}
                  label="Category"
                  placeholder="Pick a Category"
                  disabled={categories.length === 0}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  searchable
                  data={business}
                  value={form.getInputProps("supplier_id").value?.toString()}
                  onChange={handleSupplierChange}
                  label="Supplier"
                  placeholder="Pick a supplier business this belongs to"
                />
                <Select
                  searchable
                  data={subcategories.map((sub) => ({
                    label: sub.name,
                    value: sub.id,
                  }))}
                  value={form.getInputProps("category_id").value?.toString()}
                  onChange={(val) => form.setFieldValue("category_id", val)}
                  label="Subcategory"
                  placeholder="Pick a subcategory this product belongs to"
                  disabled={subcategories.length === 0}
                />
              </Grid.Col>

              <Grid.Col span={2}>
                <TextInput
                  label="Days"
                  placeholder="Days"
                  {...form.getInputProps("days")}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <TextInput
                  label="Hours"
                  placeholder="Hours"
                  {...form.getInputProps("hours")}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <TextInput
                  label="Minutes"
                  placeholder="Minutes"
                  {...form.getInputProps("minutes")}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={4}>
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

export default ShippingUpdateModal;
