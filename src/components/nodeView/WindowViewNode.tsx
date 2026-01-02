import React, {useRef, useLayoutEffect} from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
    Chip,
    Stack,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText
} from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import YouTube from "react-youtube";
import {gsap} from "gsap";
import {useNodeTaxonomy, useTabsByIds} from "@src/hooks/index";

import {cacheUser, NodeViewData} from "@src/context/index";
import {capitalizeFirstLetter} from "@src/utils/index";
import {NodeConnectionViewer} from "@src/components/index";
import {useUIStore} from "@src/store";
import {youtubeWrapper} from "@src/styles/stylesNodeView";
import {useTranslation} from "react-i18next";

const textHardcoded = "components.nodeConnectionViewer.";

interface WindowViewNodeProps {
    open: boolean;
    onClose: () => void;
    nodeData: NodeViewData | null;

}

const WindowViewNode: React.FC<WindowViewNodeProps> = ({open, onClose, nodeData}) => {
    const taxonomy = useNodeTaxonomy(nodeData ?. id ?? 0);
    const tabs = useTabsByIds(taxonomy ?. tab_ids);
    const contentRef = useRef < HTMLDivElement > (null);
    const {t} = useTranslation();

    useLayoutEffect(() => {
        if (! contentRef.current) 
            return;
        


        contentRef.current.scrollTo({top: 0, behavior: "auto"});

        const tl = gsap.timeline();

        tl.to(contentRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: "power1.inOut"
        }).set(contentRef.current, {scrollTop: 0}).to(contentRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out"
        });
        useUIStore.setState({connectionViewerActiveStep: null});
    }, [nodeData]);

    return (<Dialog open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md">
        <DialogTitle sx={
            {
                fontWeight: 600,
                fontSize: "1.4rem"
            }
        }> {
            capitalizeFirstLetter(nodeData ?. name ?? "Node Name")
        } </DialogTitle>

        <DialogContent dividers
            ref={contentRef}
            sx={
                {overflowY: "auto"}
        }>
            <Box sx={youtubeWrapper}> {
                nodeData ?. videoid && nodeData.videoid.length > 30 ? (<iframe src={
                        `https://drive.google.com/file/d/${
                            nodeData.videoid
                        }/preview`
                    }
                    width="640"
                    height="360"
                    allow="autoplay"
                    allowFullScreen/>) : (<YouTube videoId={
                    nodeData ?. videoid
                }/>)
            } </Box>

            {/* Categorías */}
            <Stack direction="row"
                spacing={1}
                mb={2}> {
                tabs.map((tab) => (<Chip key={
                        tab.id
                    }
                    label={
                        capitalizeFirstLetter(localStorage.getItem(cacheUser.languageUser) === "es" ? tab.title_es || tab.label : tab.title_en || tab.label)
                    }
                    color="success"
                    size="small"
                    variant="outlined"/>))
            } </Stack>
            <Divider sx={
                {my: 2}
            }/> {/* Relaciones entre nodos */}
            <NodeConnectionViewer nodeId={
                nodeData ?. id ? nodeData.id : 0
            }/> {/* Descripción */}
            {
            nodeData ?. description ?. summary && (<Box>
                <Typography variant="h4" gutterBottom> {
                    t(textHardcoded + "descriptionLabel")
                } </Typography>
                <Typography variant="subtitle2"> {
                    nodeData.description.summary
                } </Typography>
                <List> {
                    nodeData.description.points.map((p, i) => (<ListItem sx={
                            {py: 0.4}
                        }
                        key={i}> {
                        < ArrowRightIcon />
                    }
                        <ListItemText primary={p}/>
                    </ListItem>))
                } </List>
            </Box>)
        } </DialogContent>
    </Dialog>);
};

export default WindowViewNode;
