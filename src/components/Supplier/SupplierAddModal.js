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
import {CREATE_SUPPLIER } from "apollo/mutuations";
import {GET_SUPPLIERS } from "apollo/queries";
import { customLoader } from "components/utilities/loader";

const SupplierAddModal = ({
  setOpened,
  size,
  activePage,
}) => {

  const form = useForm({
    initialValues: {
      name: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
    
    validate: {
      password_confirmation: (value, values) => {
        if (value !== values.password) {
          return "Passwords do not match!";
        }
        return null; // No error
      },
    },
  });
  // mutation
  const [addSupplier, { loading: supplierLoading }] = useMutation(
    CREATE_SUPPLIER,
    {
      update(cache, { data: { createSupplier } }) {
        cache.updateQuery(
          {
            query: GET_SUPPLIERS,
            variables: {
              first: parseInt(size),
              page: activePage,
              search: "",
            },
          },
          (data) => {
            return {
              suppliers: {
                ...data.suppliers,
                data: [createSupplier, ...data.suppliers.data],
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
        name: form.getInputProps("name").value,
        phone: form.getInputProps("phone").value,
        email: form.getInputProps("email").value,
        city: form.getInputProps("city").value,
        address: form.getInputProps("address").value,
        password: form.getInputProps("password").value,
        password_confirmation: form.getInputProps("password_confirmation").value,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Supplier Created Successfully",
        });
        setOpened(false);
      },
      onError(error) {
        let errorMessage = "Supplier Not Created Successfully!";
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
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Name"
                  placeholder="Name"
                  {...form.getInputProps("name")}
                />
                <TextInput
                  required
                  label="Address"
                  placeholder="Address"
                  {...form.getInputProps("address")}
                />
                <TextInput
                  required
                  label="City"
                  placeholder="City"
                  {...form.getInputProps("city")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Contact Email"
                  placeholder="Email"
                  {...form.getInputProps("email")}
                />
                <TextInput
                  required
                  label="Contact Phone"
                  placeholder="Phone"
                  {...form.getInputProps("phone")}
                />
                  <PasswordInput
                  placeholder="Confirm Password"
                  label="Confirm Password"
                  error={form.errors.password_confirmation} 
                  {...form.getInputProps("password_confirmation")}
                />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={6}>
                <PasswordInput
                  placeholder="Password"
                  label="Password"
                  {...form.getInputProps("password")}
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

export default SupplierAddModal;
