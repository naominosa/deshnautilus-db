import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { db, auth } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "../Styles/styles.css";
import { signOut } from "firebase/auth";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export interface Property {
  id?: string;
  DATE: string;
  PROPERTY: string;
  VALUE: string;
  COMMISSION: string;
  CONTACT: string;
  CONTACT_STATUS: string;
  ADDRESS: string;
  REFERENCE_NO: number;
  STATUS: string;
  TITLE: string;
  PURPOSE: string;
}

function Excelsheet() {
  const [data, setData] = useState<Property[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);

  const propertiesCollection = collection(db, "properties");

  const formatNumber = (num: any) => {
    const val = Number(num);
    return isNaN(val) ? num : new Intl.NumberFormat("en-US").format(val);
  };

  const fetchData = async () => {
    const snapshot = await getDocs(propertiesCollection);

    const fetchedData = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      REFERENCE_NO: Number(d.data().REFERENCE_NO),
    })) as Property[];

    fetchedData.sort((a, b) => b.DATE.localeCompare(a.DATE));

    setData(fetchedData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusChip = (status: string) => {
    switch (status) {
      case "Sold":
        return <Chip label="SOLD" color="success" />;
      case "Leased":
        return <Chip label="LEASED" color="primary" />;
      case "Withdrawn":
        return <Chip label="WITHDRAWN" color="error" />;
      default:
        return <Chip label="AVAILABLE" color="warning" />;
    }
  };

  const columns = useMemo<MRT_ColumnDef<Property>[]>(
    () => [
      { accessorKey: "DATE", header: "Date" },
      { accessorKey: "PROPERTY", header: "Property Name" },
      { accessorKey: "TITLE", header: "Title" },
      { accessorKey: "PURPOSE", header: "Purpose" },
      {
        accessorKey: "STATUS",
        header: "Status",
        Cell: ({ cell }) => getStatusChip(cell.getValue<string>()),
        editVariant: "select",
        editSelectOptions: ["Available", "Sold", "Leased", "Withdrawn"],
      },
      {
        accessorKey: "VALUE",
        header: "Value",
        Cell: ({ cell }) => formatNumber(cell.getValue()),
      },
      {
        accessorKey: "COMMISSION",
        header: "Commission",
        Cell: ({ cell }) => formatNumber(cell.getValue()),
      },
      { accessorKey: "REFERENCE_NO", header: "Reference No." },
      { accessorKey: "CONTACT", header: "Contact" },
      {
        accessorKey: "CONTACT_STATUS",
        header: "Contact Type",
        editVariant: "select",
        editSelectOptions: [
          "Owner",
          "Caretaker",
          "Agent",
          "Broker",
          "Developer",
        ],
      },
      { accessorKey: "ADDRESS", header: "Address" },
    ],
    []
  );

  const handleMenuOpen = (
    e: React.MouseEvent<HTMLButtonElement>,
    row: any
  ) => {
    setAnchorEl(e.currentTarget);
    setMenuRow(row);
  };

  const exportToExcel = () => {
    const exportData = data.map(({ id, ...rest }) => rest);

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Properties");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer]);
    saveAs(blob, "properties.xlsx");
  };

  return (
    <div className="container">
      {/* HEADER */}
      <div className="header">
        <h1 className="title">Desh Nautilus — Property Management</h1>

        <div>
          <Button
            variant="contained"
            onClick={() => setOpenModal(true)}
            style={{ marginRight: "10px" }}
          >
            Add Property
          </Button>

          <Button
            variant="contained"
            onClick={exportToExcel}
            style={{ marginRight: "10px" }}
          >
            Export Excel
          </Button>

          <Button variant="contained" color="error" onClick={() => signOut(auth)}>
            Logout
          </Button>
        </div>
      </div>

      {/* ADD PROPERTY MODAL */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md">
        <DialogTitle>Add New Listing</DialogTitle>

        <DialogContent>
          <form
            className="form-grid"
            onSubmit={async (e) => {
              e.preventDefault();

              const fd = new FormData(e.currentTarget);

              const newEntry: Property = {
                DATE: fd.get("DATE") as string,
                PROPERTY: fd.get("PROPERTY") as string,
                VALUE: String(fd.get("VALUE")),
                COMMISSION: String(fd.get("COMMISSION")),
                CONTACT: fd.get("CONTACT") as string,
                CONTACT_STATUS: fd.get("CONTACT_STATUS") as string,
                ADDRESS: fd.get("ADDRESS") as string,
                REFERENCE_NO: Number(fd.get("REFERENCE_NO")),
                STATUS: fd.get("STATUS") as string,
                TITLE: fd.get("TITLE") as string,
                PURPOSE: fd.get("PURPOSE") as string,
              };

              try {
                const docRef = await addDoc(propertiesCollection, newEntry);

                setData((prev) => [{ ...newEntry, id: docRef.id }, ...prev]);

                setOpenModal(false);
                (e.target as HTMLFormElement).reset();
              } catch (error) {
                console.error(error);
                alert("Failed to add property");
              }
            }}
          >
            <input name="DATE" type="date" required />
            <input name="PROPERTY" placeholder="Property" required />
            <input name="TITLE" placeholder="Title" />
            <input name="PURPOSE" placeholder="Purpose" />

            <select name="STATUS">
              <option>Available</option>
              <option>Sold</option>
              <option>Leased</option>
              <option>Withdrawn</option>
            </select>

            <input name="VALUE" placeholder="Value" required />
            <input name="COMMISSION" placeholder="Commission" required />
            <input name="REFERENCE_NO" placeholder="Reference No" required />
            <input name="CONTACT" placeholder="Contact" />

            <select name="CONTACT_STATUS">
              <option>Owner</option>
              <option>Caretaker</option>
              <option>Agent</option>
              <option>Broker</option>
              <option>Developer</option>
            </select>

            <input name="ADDRESS" placeholder="Address" />

            <Button type="submit" variant="contained">
              Save Property
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* TABLE */}
      <MaterialReactTable
        columns={columns}
        data={data}
        getRowId={(row) => row.id!}
        enableEditing
        editDisplayMode="modal"
       onEditingRowSave={async ({ exitEditingMode, row, values }) => {
  try {
    const propertyId = row.original?.id;

    if (!propertyId) {
      alert("Missing Property ID");
      return;
    }

    // ✅ Remove undefined fields
    const cleanedValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== undefined)
    );

    // ✅ Force number conversion safely
    if (cleanedValues.REFERENCE_NO) {
      cleanedValues.REFERENCE_NO = Number(cleanedValues.REFERENCE_NO);
    }

    await updateDoc(doc(db, "properties", propertyId), cleanedValues);

    // Update UI
    setData((prev) =>
      prev.map((item) =>
        item.id === propertyId ? { ...item, ...cleanedValues } : item
      )
    );

    exitEditingMode();
  } catch (error) {
    console.error("Firebase Update Error:", error);
    alert("Failed to update property");
  }
}}

        renderRowActions={({ row, table }) => (
          <>
            <IconButton onClick={(e) => handleMenuOpen(e, row)}>
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  table.setEditingRow(menuRow);
                  setAnchorEl(null);
                }}
              >
                Edit Entry
              </MenuItem>

              <MenuItem
                onClick={async () => {
                  if (window.confirm("Delete property permanently?")) {
                    await deleteDoc(doc(db, "properties", menuRow.original.id));
                    fetchData();
                  }
                  setAnchorEl(null);
                }}
              >
                Delete Permanently
              </MenuItem>
            </Menu>
          </>
        )}
        enableRowActions
      />
    </div>
  );
}

export default Excelsheet;
