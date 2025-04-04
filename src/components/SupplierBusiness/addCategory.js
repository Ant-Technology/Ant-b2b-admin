import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  Select,
  LoadingOverlay,
  PasswordInput,
  MultiSelect,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import {
  CREATE_PRODUCT_CATEGORIES,
  CREATE_SUPPLIER_commission,
} from "apollo/mutuations";
import {
  GET_Product_CATEGORIES,
  GET_SUPPLIERS,
  GET_SUPPLIERS_Commission,
  NON_PAGINATED_CATEGORIES,
} from "apollo/queries";
import { customLoader } from "components/utilities/loader";

const ProductCategoryAddModal = ({ id, setOpened, size, activePage }) => {
  const form = useForm({
    initialValues: {
      category_ids: [],
    },
  });
  const [dropDownData, setDropDownData] = useState([]);
  const { loading: categoryLoading,refetch } = useQuery(NON_PAGINATED_CATEGORIES, {
    onCompleted(data) {
      const enArr = data.categoryNonPaginated.map((item) => ({
        label: item.name,
        value: item.id,
        children: item.children,
      }));

      setDropDownData(enArr);
    },
  });
    useEffect(() => {
      refetch();
    }, []);
  // mutation
  const [addProductCategory, { loading: commissionLoading }] = useMutation(
    CREATE_PRODUCT_CATEGORIES,
    {
      update(cache, { data: { createSupplierProductCategory } }) {
        cache.updateQuery(
          {
            query: GET_Product_CATEGORIES,
            variables: {
              supplier_id: id,
              first: parseInt(size),
              page: activePage,
              ordered_by: [
                {
                  column: "CREATED_AT",
                  order: "DESC",
                },
              ],
            },
          },
          (data) => {
            console.log(data)
            return {
              supplierProductCategories: {
                ...data.supplierProductCategories,
                data: [
                  createSupplierProductCategory,
                  ...data.supplierProductCategories.data,
                ],
              },
            };
          }
        );
      },
    }
  );

  const { height } = useViewportSize();
  const submit = () => {
    if (form.validate().hasErrors) {
      return;
    }
    addProductCategory({
      variables: {
        supplier_business_id: id,
        category_ids:
          form.values.category_ids.length > 0 ? form.values.category_ids : [],
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Product category Created Successfully",
        });
        setOpened(false);
      },
      onError(error) {
        let errorMessage = "Product category Not Created Successfully!";
        if (error?.graphQLErrors?.length) {
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
    form.setFieldValue("category_ids", val || []);
  };
  return (
    <>
      <LoadingOverlay
        visible={categoryLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())}>
          <Stack>
            <Grid>
              <Grid.Col span={12}>
                <MultiSelect
                  searchable
                  clearable
                  data={dropDownData}
                  value={form.values.category_ids}
                  onChange={handleCategoryChange}
                  label="Category"
                  placeholder="Pick a category this product belongs to"
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={12}>
                <Button
                  style={{
                    width: "30%",

                    backgroundColor: "#FF6A00",
                    color: "#FFFFFF",
                  }}
                  fullWidth
                  type="submit"
                  color="blue"
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

export default ProductCategoryAddModal;
