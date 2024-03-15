import { useState } from "react";
import {
  Table,
  ScrollArea,
  Card,
  Button,
  Modal,
  LoadingOverlay,
  Grid,
  Stack,
  Select,
} from "@mantine/core";
import { ManualGearbox } from "tabler-icons-react";
import { useForm } from "@mantine/form";
import { useQuery, useMutation } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { customLoader } from "components/utilities/loader";
import { GET_ORDER, GET_PRODUCT, GET_SHIPMENTS } from "apollo/queries";
import { SHIP_ITEM } from "apollo/mutuations";

function ProductDetailModal({ Id }) {
  // state variables
  const [product, setProduct] = useState();
  const [showFullDescription, setShowFullDescription] = useState(false);

  // mutation
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const { loading: productLoading } = useQuery(GET_PRODUCT, {
    variables: { id: Id },
    onCompleted(data) {
      let order = data.product;
      setProduct(order);
    },
  });

  return (
    <div style={{ width: "98%", margin: "auto" }}>
      <LoadingOverlay
        visible={productLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <Card shadow="sm" p="lg">
        <ScrollArea>
          <Table
            horizontalSpacing="md"
            verticalSpacing="xs"
            sx={{ tableLayout: "fixed", minWidth: 700 }}
          >
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Orders</th>
                <th>Product Variants</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <td>{product?.name}</td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                {showFullDescription
                  ? product?.description
                  : `${product?.description.substring(0, 50)}...`}
                {product?.description.length > 50 && (
                  <span
                    style={{ color: "blue", cursor: "pointer" }}
                    onClick={toggleDescription}
                  >
                    {showFullDescription ? "See Less" : "See More"}
                  </span>
                )}
              </td>
            </tbody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}

export default ProductDetailModal;
