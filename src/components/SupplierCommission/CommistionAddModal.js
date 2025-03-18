import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  Select,
  LoadingOverlay,
  PasswordInput,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { CREATE_SUPPLIER_commission } from "apollo/mutuations";
import { GET_SUPPLIERS, GET_SUPPLIERS_Commission } from "apollo/queries";
import { customLoader } from "components/utilities/loader";

const CommissionAddModal = ({ setOpened, size, activePage }) => {
  const [suppliers, setSuppliers] = useState([]);
  const form = useForm({
    initialValues: {
      supplier_id: 2,
      commission_rate: "",
    },

    validate: {
      commission_rate: (value) => {
        if (value === "") {
          return "commission_rate is required";
        }
        if (isNaN(value)) {
          return "commission_rate must be a valid number";
        }
        if (parseFloat(value) <= 0) {
          return "commission_rate must be a positive number";
        }
        return null;
      },
    },
  });
  const { loading: supplierLoading } = useQuery(GET_SUPPLIERS, {
    variables: {
      first: parseInt(1000),
      page: 1,
      search: "",
    },

    onCompleted(data) {
      const arr = data.suppliers.data.map((item) => ({
        label: item.user?.name,
        value: item.id,
      }));

      setSuppliers(arr);
    },
  });
  // mutation
  const [addSupplier, { loading: commissionLoading }] = useMutation(
    CREATE_SUPPLIER_commission,
    {
      update(cache, { data: { createSupplierCommission } }) {
        cache.updateQuery(
          {
            query: GET_SUPPLIERS_Commission,
            variables: {
              first: parseInt(size),
              page: activePage,
              search: "",
            },
          },
          (data) => {
            return {
              supplier_commissions: {
                ...data.supplier_commissions,
                data: [
                  createSupplierCommission,
                  ...data.supplier_commissions.data,
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
    addSupplier({
      variables: {
        supplier_id: form.getInputProps("supplier_id").value,
        commission_rate: parseFloat(
          form.getInputProps("commission_rate").value
        ),
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Supplier Commission Created Successfully",
        });
        setOpened(false);
      },
      onError(error) {
        let errorMessage = "Supplier Commission Not Created Successfully!";
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
  const handleSupplierChange = (val) => {
    form.setFieldValue("supplier_id", val);
  };
  return (
    <>
      <LoadingOverlay
        visible={supplierLoading}
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
                  label="Commission Rate"
                  placeholder="commission Rate"
                  {...form.getInputProps("commission_rate")}
                  error={form.errors.commission_rate}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Select
                  searchable
                  data={suppliers}
                  value={form.getInputProps("supplier_id").value.toString()}
                  onChange={handleSupplierChange}
                  label="Supplier"
                  placeholder="Pick a supplier this belongs to"
                />{" "}
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

export default CommissionAddModal;
