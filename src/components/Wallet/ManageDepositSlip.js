import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Image,
  ScrollArea,
  Skeleton,
  Text,
  Loader,
  Grid,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import {
  CONFIRM_DEPOSIT_SLIP,
  DIS_APPROVE_DEPOSIT_SLIP,
} from "apollo/mutuations";
import { DEPOSIT_SLIP, DEPOSIT_SLIPS } from "apollo/queries";
import { showNotification } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "utiles/url";

const ManageDepositSlip = ({
  editId,
  setOpenedEdit,
  total,
  fetchData,
  setTotal,
  activePage,
  setActivePage,
}) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true); // New state for image loading

  useEffect(() => {
    fetchDeposit();
  }, [editId]);

  const fetchDeposit = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(
        `${API}/deposit-slips/${editId}`,
        config
      );
      if (data) {
        setLoading(false);
        setData(data);
      }
    } catch (error) {
      setLoading(false);
      setImageLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const [confirmDeposit, { loading: confirmLoading }] = useMutation(
    CONFIRM_DEPOSIT_SLIP,
    {
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Approved Successfully",
        });
        // After confirming the deposit, call fetchData from Wallets component
        fetchData(activePage);
        setOpenedEdit(false);
      },
      onError(error) {
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const errorMessage = error.graphQLErrors[0].extensions.errors.message;
          setOpenedEdit(false);
          showNotification({
            color: "red",
            title: "Error",
            message: errorMessage || "Deposit Confirmation Error",
          });
        } else {
          setOpenedEdit(false);
          showNotification({
            color: "red",
            title: "Error",
            message: "Something went wrong!",
          });
        }
      },
    }
  );
  const [disapproveDeposit, { loading: disapproveLoading }] = useMutation(
    DIS_APPROVE_DEPOSIT_SLIP,
    {
      onCompleted(data) {
        // After confirming the deposit, call fetchData from Wallets component
        fetchData(activePage);
        setOpenedEdit(false);
      },
      onError(error) {
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const errorMessage = error.graphQLErrors[0].extensions.errors.message;
          setOpenedEdit(false);
          showNotification({
            color: "red",
            title: "Error",
            message: errorMessage || "Deposit Disapprove Error",
          });
        } else {
          setOpenedEdit(false);
          showNotification({
            color: "red",
            title: "Error",
            message: "Something went wrong!",
          });
        }
      },
    }
  );

  const { height } = useViewportSize();

  const submit = (e) => {
    e.preventDefault();
    confirmDeposit({
      variables: {
        deposit_id: editId,
      },
    });
  };

  const disapprove = (e) => {
    e.preventDefault();
    disapproveDeposit({
      variables: {
        deposit_id: editId,
      },
    });
  };

  return (
    <div>
      <ScrollArea style={{ height: height / 1.1 }}>
        {imageLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: height / 1.4,
            }}
          >
            <Loader size="xl" /> {/* Spinner */}
          </div>
        )}
        <Image
          height={height / 1.4}
          src={data?.slip ? data?.slip : ""}
          alt="With default placeholder"
          withPlaceholder
          placeholder={<Text align="center">No slip Found!</Text>}
          onLoad={() => setImageLoading(false)} // Set image loading state to false on load
          style={{
            display: imageLoading ? "none" : "block",
            paddingTop: "20px",
          }} // Hide image while loading
        />
        <Skeleton height={8} visible={loading || confirmLoading}></Skeleton>
        {data?.confirmed_at ? (
          <Button
            style={{
              marginTop: "20px",
              width: "30%",

              backgroundColor: "#FF6A00",
              color: "#FFFFFF",
            }}
            type="submit"
            fullWidth
            onClick={disapprove}
          >
            Reverse Approval
          </Button>
        ) : (
          <Button
            onClick={submit}
            style={{
              marginTop: "20px",
              width: "30%",

              backgroundColor: "#FF6A00",
              color: "#FFFFFF",
            }}
            type="submit"
            fullWidth
          >
            Approve Deposit
          </Button>
        )}
      </ScrollArea>
    </div>
  );
};

export default ManageDepositSlip;
