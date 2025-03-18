import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  LoadingOverlay,
} from "@mantine/core";
import React, { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { customLoader } from "components/utilities/loader";
import { UPDATE_SUPPLIER_Commistion } from "apollo/mutuations";

const CommissionEditModal = ({ commistion, setOpenedEdit }) => {
  const form = useForm({
    initialValues: {
      commission_rate: "",
    },
    validate: {
      commission_rate: (value) => {
        const floatValue = parseFloat(value);
        if (isNaN(floatValue) || floatValue <= 0) {
          return "Commission rate must be a positive number!";
        }
        return null; // No error
      },
    },
  });

  const [updateRetailer, { loading: supplierLoading }] =
    useMutation(UPDATE_SUPPLIER_Commistion);

  useEffect(() => {
    if (commistion) {
      form.setValues({
        commission_rate: commistion.commission_rate,
      });
    }
  }, [commistion]);

  const { height } = useViewportSize();

  const submit = () => {
    if (form.validate().hasErrors) {
      return; // Exit if there are validation errors
    }

    updateRetailer({
      variables: {
        id: commistion.id,
        commission_rate: parseFloat(form.values.commission_rate),
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Commission Updated Successfully",
        });

        setOpenedEdit(false);
      },
      onError(error) {
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Commission Not Updated Successfully",
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
              <Grid.Col span={12}>
                <TextInput
                  required
                  label="Commission Rate"
                  placeholder="Commission Rate"
                  {...form.getInputProps("commission_rate")}
                  error={form.errors.commission_rate}
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

export default CommissionEditModal;