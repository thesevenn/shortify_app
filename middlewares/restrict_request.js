import restrictModel from "../models/restrictModel.js";

export const restrict_request = async ( req, res, next ) => {
    const current_ip = req.ip;
    try {
        const exist_ip = await restrictModel.findOne( { current_ip: current_ip } );
        if( exist_ip ) {

            if( exist_ip.until_restrict <= 0 ) {
                req.restrict_in = 0;
                next();
            } else {
                const left_requests = exist_ip.until_restrict >= 0 && exist_ip.until_restrict - 1;
                const response = await restrictModel.findOneAndUpdate( { current_ip: current_ip }, { until_restrict: left_requests }, { new: true } );
                req.restrict_in = response.until_restrict;
                next();
            }
        } else {
            const newIP = new restrictModel( { current_ip: current_ip } );
            const response = await newIP.save();
            req.restrict_in = 7;
            next();
        }
    } catch( error ) {
        res.render( 'error', {
            status_code: '500',
            error_message: "something went wrong on our side.",
            dev_qoute: "Huh! looks like our developers are on vacation"
        } );
    }

}